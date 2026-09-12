import express from 'express';
import { db } from '../db/index.js';
import { ProjectContract, ProjectMilestone, ChangeRequest, ProjectBaseline, ContractParty, ContractRevision } from '../types/execution.js';
import { rfqRepository } from '../repositories/rfqRepository.js';
import { projectRepository } from '../repositories/projectRepository.js';

const router = express.Router({ mergeParams: true });

// --- Contracts ---
router.get('/:projectId/contracts', (req, res) => {
  const { projectId } = req.params;
  const contracts = db.getProjectContracts(projectId);
  res.json(contracts);
});

// Create contract manually
router.post('/:projectId/contracts', (req, res) => {
  const { projectId } = req.params;
  const contractData = req.body;
  const allContracts = db.getEnergyProjects().flatMap((p: any) => db.getProjectContracts(p.id)) || [];
  const seqNumber = allContracts.length + 1;
  const contractCode = contractData.contractCode || `CNT-HSE-${seqNumber.toString().padStart(6, '0')}`;

  const newContract = db.createContract({
    ...contractData,
    contractCode,
    projectId,
    status: contractData.status || 'DRAFT',
    currentRevisionNumber: 1
  });
  
  res.status(201).json(newContract);
});

// Create contract directly from an awarded/selected EPC Bid
router.post('/:projectId/contracts/from-bid/:bidId', (req, res) => {
  const { projectId, bidId } = req.params;
  const project = projectRepository.findById(projectId);
  if (!project) return res.status(404).json({ error: 'پروژه یافت نشد' });

  const bid = rfqRepository.getBidById(bidId);
  if (!bid) return res.status(404).json({ error: 'پیشنهاد EPC یافت نشد' });

  const org = db.getOrganizationById?.(bid.epcOrganizationId);
  const contractorName = org?.tradeName || org?.legalName || 'پیمانکار منتخب EPC';

  const plannedWeeks = bid.commercialTerms?.executionDurationWeeks || 16;
  const startDate = new Date();
  const completionDate = new Date(startDate.getTime() + plannedWeeks * 7 * 24 * 60 * 60 * 1000);

  // Derive stable business contract code: CNT-HSE-000001
  const allContracts = db.getEnergyProjects().flatMap((p: any) => db.getProjectContracts(p.id)) || [];
  const seqNumber = allContracts.length + 1;
  const contractCode = `CNT-HSE-${seqNumber.toString().padStart(6, '0')}`;

  // Check which terms actually exist in the EPC bid
  const hasBidAdvance = typeof bid.commercialTerms?.advancePaymentPercent === 'number';
  const hasBidRetention = typeof bid.commercialTerms?.retentionPercent === 'number';
  const hasBidWarranty = typeof bid.commercialTerms?.warrantyPeriodMonths === 'number';
  const hasBidLD = typeof bid.commercialTerms?.liquidatedDamagesPerDayPercent === 'number';
  const hasBidPaymentTerms = Boolean(bid.commercialTerms?.paymentTermsSummary || bid.commercialTerms?.paymentTerms);

  // If not all terms are explicit in bid, mark as template terms requiring confirmation
  const isTemplateTerms = !(hasBidAdvance && hasBidRetention && hasBidWarranty && hasBidPaymentTerms);

  const advancePaymentPercent = hasBidAdvance ? bid.commercialTerms.advancePaymentPercent : undefined;
  const retentionPercent = hasBidRetention ? bid.commercialTerms.retentionPercent : undefined;
  const warrantyPeriodMonths = hasBidWarranty ? bid.commercialTerms.warrantyPeriodMonths : undefined;
  const liquidatedDamagesPerDayPercent = hasBidLD ? bid.commercialTerms.liquidatedDamagesPerDayPercent : undefined;
  const maxLiquidatedDamagesPercent = typeof bid.commercialTerms?.maxLiquidatedDamagesPercent === 'number' ? bid.commercialTerms.maxLiquidatedDamagesPercent : undefined;

  const paymentTermsSummary = hasBidPaymentTerms 
    ? (bid.commercialTerms.paymentTermsSummary || bid.commercialTerms.paymentTerms)
    : 'الگوی پیشنهادی شرایط پرداخت: پیش‌پرداخت (نیازمند تایید)، پیشرفت کار و تحویل تجهیزات، اتصال به شبکه و حسن انجام کار (در انتظار تایید کارفرما).';

  // 1. Create the contract
  const newContract = db.createContract({
    projectId,
    contractCode,
    title: `قرارداد جامع احداث نیروگاه خورشیدی (EPC) - مجری: ${contractorName}`,
    contractType: 'EPC',
    status: 'DRAFT',
    currency: bid.currency || 'IRR',
    contractValue: bid.totalPrice,
    revisedContractValue: bid.totalPrice,
    currentRevisionNumber: 1,
    scopeSummary: `احداث، مهندسی، تأمین تجهیزات استاندارد (پنل و اینورتر مطابق پیشنهاد ${bid.bidCode})، نصب، کابل‌کشی، حفاظت، اتصال به شبکه و راه‌اندازی تجاری نیروگاه خورشیدی.`,
    paymentTermsSummary,
    retentionPercent,
    advancePaymentPercent,
    liquidatedDamagesPerDayPercent,
    maxLiquidatedDamagesPercent,
    warrantyPeriodMonths,
    contractorPartyId: bid.epcOrganizationId,
    plannedStartDate: startDate.toISOString().split('T')[0],
    plannedCompletionDate: completionDate.toISOString().split('T')[0],
    isTemplateTerms,
    termsConfirmedByUser: !isTemplateTerms,
    createdByUserId: req.body.userId || project.ownerId
  });

  // 2. Create Contract Parties (Client & EPC Contractor)
  db.createContractParty({
    contractId: newContract.id,
    partyType: 'CLIENT',
    organizationId: project.ownerId,
    legalName: 'کارفرمای پروژه انرژی',
    representativeName: 'مدیر پروژه',
    signStatus: 'PENDING'
  });

  db.createContractParty({
    contractId: newContract.id,
    partyType: 'CONTRACTOR',
    organizationId: bid.epcOrganizationId,
    legalName: contractorName,
    representativeName: org?.contactPerson || 'مدیرعامل شرکت EPC',
    signStatus: 'PENDING'
  });

  // 3. Create Milestone Structure (Marked clearly as SUGGESTED_TEMPLATE)
  const durationTotalDays = plannedWeeks * 7;
  const milestonesTemplate = [
    { title: 'مهندسی، طراحی تفصیلی و نقشه‌های اجرایی', category: 'ENGINEERING', sequence: 1, weightPercent: 10, durationFactor: 0.15 },
    { title: 'تأمین، ترخیص و حمل پنل‌ها و اینورترها به کارگاه', category: 'PROCUREMENT', sequence: 2, weightPercent: 45, durationFactor: 0.40 },
    { title: 'عملیات عمرانی، کوبش پایه‌ها و فونداسیون اینورتر', category: 'CIVIL_WORKS', sequence: 3, weightPercent: 15, durationFactor: 0.20 },
    { title: 'نصب مکانیکی استراکچرها و ماژول‌ها و کابل‌کشی DC/AC', category: 'INSTALLATION', sequence: 4, weightPercent: 15, durationFactor: 0.15 },
    { title: 'تست‌های پیش‌راه‌اندازی، اتصال به شبکه و آزمون ۷۲ ساعته', category: 'COMMISSIONING', sequence: 5, weightPercent: 15, durationFactor: 0.10 }
  ];

  let cumulativeOffsetDays = 0;
  milestonesTemplate.forEach((t) => {
    const stageDurationDays = Math.max(7, Math.round(durationTotalDays * t.durationFactor));
    const pStart = new Date(startDate.getTime() + cumulativeOffsetDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    cumulativeOffsetDays += stageDurationDays;
    const pEnd = new Date(startDate.getTime() + cumulativeOffsetDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    db.createMilestone({
      projectId,
      contractId: newContract.id,
      milestoneCode: `MS-0${t.sequence}`,
      title: t.title,
      category: t.category,
      sequence: t.sequence,
      weightPercent: t.weightPercent,
      completionPercent: 0,
      status: 'NOT_STARTED',
      plannedStartDate: pStart,
      plannedEndDate: pEnd,
      requiresApproval: true,
      evidenceRequired: true,
      isTemplate: true,
      templateNotice: 'SUGGESTED_TEMPLATE — ساختار پیشنهادی زمان‌بندی (نیازمند تایید طرفین)'
    });
  });

  // 4. Create Initial Project Baseline in DRAFT status (NOT automatically approved!)
  db.createProjectBaseline({
    projectId,
    contractId: newContract.id,
    baselineCode: `BL-HSE-${seqNumber.toString().padStart(4, '0')}`,
    name: 'خط مبنای اولیه زمان‌بندی و هزینه قرارداد EPC (Baseline V1 - پیش‌نویس)',
    status: 'DRAFT',
    contractValue: bid.totalPrice,
    currency: bid.currency || 'IRR',
    plannedStartDate: startDate.toISOString().split('T')[0],
    plannedCompletionDate: completionDate.toISOString().split('T')[0],
    approvedByUserId: undefined,
    approvedAt: undefined
  });

  res.status(201).json({
    contract: newContract,
    message: 'پیش‌نویس قرارداد EPC با موفقیت از پیشنهاد برنده ایجاد شد. شرایط نیازمند تایید و خط مبنا در وضعیت پیش‌نویس قرار دارد.'
  });
});

router.patch('/:projectId/contracts/:contractId', (req, res) => {
  const { contractId } = req.params;
  const updated = db.updateContract(contractId, req.body);
  if (!updated) return res.status(404).json({ error: 'قرارداد یافت نشد' });
  res.json(updated);
});

// Confirm Contract Terms (Transition from template to agreed terms)
router.post('/:projectId/contracts/:contractId/confirm-terms', (req, res) => {
  const { contractId } = req.params;
  const updated = db.updateContract(contractId, {
    ...req.body,
    isTemplateTerms: false,
    termsConfirmedByUser: true,
    status: req.body.status || 'UNDER_REVIEW'
  });
  if (!updated) return res.status(404).json({ error: 'قرارداد یافت نشد' });
  res.json(updated);
});

// Contract Parties
router.get('/:projectId/contracts/:contractId/parties', (req, res) => {
  const { contractId } = req.params;
  const parties = db.getContractParties(contractId);
  res.json(parties);
});

router.post('/:projectId/contracts/:contractId/parties', (req, res) => {
  const { contractId } = req.params;
  const party = db.createContractParty({
    ...req.body,
    contractId
  });
  res.status(201).json(party);
});

// Party Sign Contract Endpoint
router.post('/:projectId/contracts/:contractId/parties/:partyId/sign', (req, res) => {
  const { contractId, partyId } = req.params;
  const parties = db.getContractParties(contractId);
  const party = parties.find((p: any) => p.id === partyId);
  if (!party) return res.status(404).json({ error: 'طرف قرارداد یافت نشد' });

  party.signStatus = 'SIGNED';
  party.signedAt = new Date().toISOString();

  const data = (db as any).readDB();
  const pIndex = data.contractParties.findIndex((p: any) => p.id === partyId);
  if (pIndex !== -1) {
    data.contractParties[pIndex] = party;
    (db as any).writeDB(data);
  }

  // Check if all parties have signed
  const allParties = db.getContractParties(contractId);
  const allSigned = allParties.length > 0 && allParties.every((p: any) => p.signStatus === 'SIGNED');

  if (allSigned) {
    db.updateContract(contractId, {
      status: 'ACTIVE',
      signedAt: new Date().toISOString(),
      effectiveDate: new Date().toISOString().split('T')[0]
    });
  } else {
    db.updateContract(contractId, {
      status: 'PENDING_SIGNATURE'
    });
  }

  res.json({ party, contractStatus: allSigned ? 'ACTIVE' : 'PENDING_SIGNATURE' });
});

// --- Contract Revisions ---
router.get('/:projectId/contracts/:contractId/revisions', (req, res) => {
  const { contractId } = req.params;
  const revisions = db.getContractRevisions(contractId);
  res.json(revisions);
});

// --- Change Requests (دستور تغییر کار / کلیم) ---
router.get('/:projectId/change-requests', (req, res) => {
  const { projectId } = req.params;
  const list = db.getChangeRequestsByProjectId(projectId);
  res.json(list);
});

router.post('/:projectId/change-requests', (req, res) => {
  const { projectId } = req.params;
  const cr = db.createChangeRequest({
    ...req.body,
    projectId,
    status: 'SUBMITTED'
  });
  res.status(201).json(cr);
});

router.patch('/:projectId/change-requests/:crId', (req, res) => {
  const { crId, projectId } = req.params;
  const updated = db.updateChangeRequest(crId, req.body);
  if (!updated) return res.status(404).json({ error: 'دستور تغییر کار یافت نشد' });

  // If approved: create ContractRevision (Do NOT silently mutate original contractValue)
  if (updated.status === 'APPROVED' && updated.contractId) {
    const contract = db.getContractById(updated.contractId);
    if (contract) {
      const nextRevNum = (contract.currentRevisionNumber || 1) + 1;
      const currentVal = contract.revisedContractValue !== undefined ? contract.revisedContractValue : contract.contractValue;
      const impact = updated.costImpactAmount || updated.costImpact || 0;
      const newVal = currentVal + impact;

      const rev = db.createContractRevision({
        contractId: contract.id,
        projectId,
        revisionNumber: nextRevNum,
        changeRequestId: updated.id,
        reason: updated.reasonCategory || updated.title,
        changesSummary: updated.description || `تایید دستور تغییر کار ${updated.crCode || updated.title}`,
        contractValueBefore: currentVal,
        contractValueAfter: newVal,
        scheduleImpactDays: updated.scheduleImpactDays || 0,
        approvedByUserId: updated.approvedByUserId || 'supervisor',
        approvedAt: updated.approvedAt || new Date().toISOString()
      });

      // Update revised value on contract record without mutating original contractValue
      db.updateContract(contract.id, {
        revisedContractValue: newVal,
        currentRevisionNumber: nextRevNum
      });

      db.updateChangeRequest(updated.id, { revisionId: rev.id });

      // If active baseline exists, supersede it and create updated approved baseline
      const activeBaseline = db.getProjectBaseline(projectId);
      if (activeBaseline && activeBaseline.status === 'APPROVED') {
        db.updateProjectBaseline(activeBaseline.id, { status: 'SUPERSEDED', supersededAt: new Date().toISOString() });
        db.createProjectBaseline({
          projectId,
          contractId: contract.id,
          baselineCode: `BL-REV-0${nextRevNum}`,
          name: `خط مبنای بازنگری شده (پیرو دستور تغییر ${updated.crCode || ''})`,
          status: 'APPROVED',
          contractValue: newVal,
          currency: contract.currency || 'IRR',
          plannedCompletionDate: activeBaseline.plannedCompletionDate,
          approvedByUserId: updated.approvedByUserId || 'supervisor',
          approvedAt: new Date().toISOString()
        });
      }
    }
  }

  res.json(updated);
});

// --- Project Baseline ---
router.get('/:projectId/baseline', (req, res) => {
  const { projectId } = req.params;
  const baseline = db.getProjectBaseline(projectId);
  res.json(baseline);
});

router.get('/:projectId/baselines', (req, res) => {
  const { projectId } = req.params;
  const baselines = db.getProjectBaselines(projectId);
  res.json(baselines);
});

router.post('/:projectId/baseline', (req, res) => {
  const { projectId } = req.params;
  const baseline = db.createProjectBaseline({
    ...req.body,
    projectId,
    status: req.body.status || 'DRAFT'
  });
  res.status(201).json(baseline);
});

// Approve Baseline Endpoint
router.post('/:projectId/baseline/:baselineId/approve', (req, res) => {
  const { baselineId, projectId } = req.params;
  const userId = req.body.userId || 'supervisor';

  // Mark any previously approved baseline as SUPERSEDED
  const allBaselines = db.getProjectBaselines(projectId);
  allBaselines.forEach((b: any) => {
    if (b.id !== baselineId && b.status === 'APPROVED') {
      db.updateProjectBaseline(b.id, { status: 'SUPERSEDED', supersededAt: new Date().toISOString() });
    }
  });

  const updated = db.updateProjectBaseline(baselineId, {
    status: 'APPROVED',
    approvedByUserId: userId,
    approvedAt: new Date().toISOString()
  });

  if (!updated) return res.status(404).json({ error: 'خط مبنا یافت نشد' });
  res.json(updated);
});

// --- Milestones ---
router.get('/:projectId/milestones', (req, res) => {
  const { projectId } = req.params;
  const milestones = db.getProjectMilestones(projectId);
  res.json(milestones);
});

router.post('/:projectId/milestones', (req, res) => {
  const { projectId } = req.params;
  const milestone = db.createMilestone({
    ...req.body,
    projectId,
    status: req.body.status || 'NOT_STARTED',
    completionPercent: req.body.completionPercent || 0
  });
  res.status(201).json(milestone);
});

router.patch('/:projectId/milestones/:milestoneId', (req, res) => {
  const { milestoneId } = req.params;
  const updated = db.updateMilestone(milestoneId, req.body);
  if (!updated) return res.status(404).json({ error: 'مایلستون یافت نشد' });
  res.json(updated);
});

router.delete('/:projectId/milestones/:milestoneId', (req, res) => {
  const { milestoneId } = req.params;
  const success = db.deleteMilestone(milestoneId);
  if (!success) return res.status(404).json({ error: 'مایلستون یافت نشد' });
  res.json({ success: true, message: 'مایلستون با موفقیت حذف شد' });
});

// --- Approvals ---
router.get('/:projectId/approvals', (req, res) => {
  const { projectId } = req.params;
  const approvals = db.getApprovalRequests(projectId);
  res.json(approvals);
});

router.post('/:projectId/approvals', (req, res) => {
  const { projectId } = req.params;
  const reqData = req.body;
  const newApproval = db.createApprovalRequest({
    ...reqData,
    projectId,
    status: 'PENDING'
  });
  res.status(201).json(newApproval);
});

router.patch('/:projectId/approvals/:approvalId', (req, res) => {
  const { approvalId } = req.params;
  const updated = db.updateApprovalRequest(approvalId, req.body);
  if (!updated) return res.status(404).json({ error: 'درخواست تایید یافت نشد' });
  
  // If it's a milestone approval and approved, update the milestone
  if (updated.status === 'APPROVED' && updated.entityType === 'MILESTONE') {
    db.updateMilestone(updated.entityId, { status: 'COMPLETED', completionPercent: 100 });
  } else if (updated.status === 'REJECTED' && updated.entityType === 'MILESTONE') {
    db.updateMilestone(updated.entityId, { status: 'NOT_STARTED' });
  }

  res.json(updated);
});

export default router;
