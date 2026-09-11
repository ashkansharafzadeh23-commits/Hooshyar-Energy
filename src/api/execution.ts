import express from 'express';
import { db } from '../db/index.js';
import { ProjectContract, ProjectMilestone, ChangeRequest, ProjectBaseline, ContractParty } from '../types/execution.js';
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
  const newContract = db.createContract({
    ...contractData,
    projectId,
    status: contractData.status || 'DRAFT',
  });
  
  // Create an initial set of milestones if it's an EPC contract
  if (newContract.contractType === 'EPC') {
    const templates = [
      { title: 'طراحی پایه و تفصیلی (Engineering)', category: 'ENGINEERING', sequence: 1, weightPercent: 10, durationDays: 20 },
      { title: 'تأمین تجهیزات اصلی و لجستیک (Procurement)', category: 'PROCUREMENT', sequence: 2, weightPercent: 40, durationDays: 45 },
      { title: 'عملیات ساختمانی و فونداسیون (Civil Works)', category: 'CIVIL_WORKS', sequence: 3, weightPercent: 15, durationDays: 30 },
      { title: 'نصب سازه، پنل‌ها و اینورترها (Installation)', category: 'INSTALLATION', sequence: 4, weightPercent: 20, durationDays: 30 },
      { title: 'تست، راه‌اندازی و اتصال به شبکه (Commissioning)', category: 'COMMISSIONING', sequence: 5, weightPercent: 15, durationDays: 15 }
    ];

    const startDate = new Date();
    let cumulativeDays = 0;

    templates.forEach(t => {
      const plannedStart = new Date(startDate.getTime() + cumulativeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      cumulativeDays += t.durationDays;
      const plannedEnd = new Date(startDate.getTime() + cumulativeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      db.createMilestone({
        projectId,
        contractId: newContract.id,
        milestoneCode: `MS-${Math.floor(Math.random()*1000)}`,
        title: t.title,
        category: t.category,
        sequence: t.sequence,
        weightPercent: t.weightPercent,
        completionPercent: 0,
        status: 'NOT_STARTED',
        plannedStartDate: plannedStart,
        plannedEndDate: plannedEnd,
        requiresApproval: true,
        evidenceRequired: true
      });
    });
  }
  
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

  // 1. Create the contract
  const contractCode = `CNT-EPC-${bid.bidCode || Math.floor(Math.random() * 10000)}`;
  const newContract = db.createContract({
    projectId,
    contractCode,
    title: `قرارداد جامع احداث نیروگاه خورشیدی (EPC) - مجری: ${contractorName}`,
    contractType: 'EPC',
    status: 'DRAFT',
    currency: bid.currency || 'IRR',
    contractValue: bid.totalPrice,
    scopeSummary: `احداث، مهندسی، تأمین تجهیزات استاندارد (پنل و اینورتر مطابق پیشنهاد ${bid.bidCode})، نصب، کابل‌کشی، حفاظت، اتصال به شبکه و راه‌اندازی تجاری نیروگاه خورشیدی.`,
    paymentTermsSummary: `پیش‌پرداخت: ۲۰٪ | ورود تجهیزات به کارگاه: ۴۰٪ | اتمام نصب مکانیکی: ۲۰٪ | برق‌داری و اتصال به شبکه: ۱۵٪ | سپرده حسن انجام کار: ۵٪`,
    retentionPercent: 5,
    advancePaymentPercent: 20,
    liquidatedDamagesPerDayPercent: 0.1,
    maxLiquidatedDamagesPercent: 10,
    warrantyPeriodMonths: bid.commercialTerms?.warrantyPeriodMonths || 24,
    contractorPartyId: bid.epcOrganizationId,
    plannedStartDate: startDate.toISOString().split('T')[0],
    plannedCompletionDate: completionDate.toISOString().split('T')[0],
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

  // 3. Create Structured Execution Milestones based on Bid Timeline
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
      evidenceRequired: true
    });
  });

  // 4. Create Initial Project Baseline
  db.createProjectBaseline({
    projectId,
    contractId: newContract.id,
    baselineCode: `BL-01-INITIAL`,
    name: 'خط مبنای اولیه قرارداد EPC (Baseline V1)',
    contractValue: bid.totalPrice,
    currency: bid.currency || 'IRR',
    plannedStartDate: startDate.toISOString().split('T')[0],
    plannedCompletionDate: completionDate.toISOString().split('T')[0],
    approvedByUserId: req.body.userId || project.ownerId,
    approvedAt: new Date().toISOString()
  });

  res.status(201).json({
    contract: newContract,
    message: 'پیش‌نویس قرارداد EPC با موفقیت از پیشنهاد برنده ایجاد و خط مبنا و مایلستون‌های اجرایی مقداردهی شدند.'
  });
});

router.patch('/:projectId/contracts/:contractId', (req, res) => {
  const { contractId } = req.params;
  const updated = db.updateContract(contractId, req.body);
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
  const { crId } = req.params;
  const updated = db.updateChangeRequest(crId, req.body);
  if (!updated) return res.status(404).json({ error: 'دستور تغییر کار یافت نشد' });

  // If approved, update contract value and schedule if specified
  if (updated.status === 'APPROVED' && updated.contractId) {
    const contract = db.getProjectContracts(updated.projectId).find(c => c.id === updated.contractId);
    if (contract && updated.costImpactAmount) {
      db.updateContract(contract.id, {
        contractValue: (contract.contractValue || 0) + updated.costImpactAmount
      });
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

router.post('/:projectId/baseline', (req, res) => {
  const { projectId } = req.params;
  const baseline = db.createProjectBaseline({
    ...req.body,
    projectId
  });
  res.status(201).json(baseline);
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
