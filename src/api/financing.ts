import { Router } from 'express';
import { db } from '../db/index.js';
import { financeReadinessService } from '../services/financeReadinessService.js';
import { debtServiceCalculator } from '../services/debtServiceCalculator.js';
import { financialPartnerMatchingService } from '../services/financialPartnerMatchingService.js';
import { financingOfferComparisonService } from '../services/financingOfferComparisonService.js';
import { canTransition } from '../services/projectLifecycleService.js';

const router = Router();

// 1. Get financing requests for a project
router.get('/projects/:projectId/financing-requests', (req, res) => {
  const requests = db.getFinancingRequests(req.params.projectId);
  res.json(requests);
});

// 2. Create financing request for a project
router.post('/projects/:projectId/financing-requests', (req, res) => {
  const projectId = req.params.projectId;
  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Get project financial model if available
  const models = db.getFinancialModelsByProjectId(projectId);
  const activeModel = models.find((m: any) => m.status !== 'SUPERSEDED') || models[0];

  let totalProjectCost = req.body.totalProjectCost;
  if (!totalProjectCost && activeModel?.results?.totalCapex?.amount) {
    totalProjectCost = activeModel.results.totalCapex.amount;
  }
  if (!totalProjectCost && project.estimatedBudgetIRR) {
    totalProjectCost = project.estimatedBudgetIRR;
  }
  if (!totalProjectCost) {
    totalProjectCost = 10000000000; // default 1B Tomans if completely unset
  }

  const ownerEquity = req.body.ownerEquity !== undefined ? req.body.ownerEquity : Math.round(totalProjectCost * 0.3);
  const securedCapital = req.body.securedCapital || 0;
  const existingDebt = req.body.existingDebt || 0;
  const fundingGap = Math.max(0, totalProjectCost - (ownerEquity + securedCapital));
  const requestedAmount = req.body.requestedAmount || fundingGap;

  const newRequest = db.createFinancingRequest({
    projectId,
    requesterUserId: req.body.requesterUserId || project.ownerId || 'user-default',
    requesterOrganizationId: req.body.requesterOrganizationId || project.organizationId,
    financialModelId: activeModel?.id,
    selectedScenarioId: req.body.selectedScenarioId,
    status: 'DRAFT',
    financingType: req.body.financingType || 'PROJECT_LOAN',
    requestedAmount,
    totalProjectCost,
    ownerEquity,
    securedCapital,
    existingDebt,
    fundingGap,
    requestedTenorMonths: req.body.requestedTenorMonths || 48,
    preferredGracePeriodMonths: req.body.preferredGracePeriodMonths || 6,
    repaymentPreference: req.body.repaymentPreference || 'EQUAL_INSTALLMENT',
    collateralAvailable: req.body.collateralAvailable !== undefined ? req.body.collateralAvailable : true,
    collateralSummary: req.body.collateralSummary || 'تضامین معتبر ملکی و اسناد تجاری',
    projectRevenueModel: req.body.projectRevenueModel || 'PPA',
    summary: req.body.summary || `درخواست تأمین مالی ساخت نیروگاه خورشیدی ${project.title}`,
    targetFinancingDate: req.body.targetFinancingDate || new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString()
  });

  // Automatically calculate initial readiness
  const contracts = db.getProjectContracts ? db.getProjectContracts(projectId) : [];
  const docs = db.getProjectDocuments ? db.getProjectDocuments(projectId) : [];
  const readiness = financeReadinessService.evaluateReadiness(newRequest, project, activeModel, contracts.length, docs.length);
  db.createFinanceReadinessSnapshot(readiness);
  db.updateFinancingRequest(newRequest.id, { readinessScore: readiness.totalScore });

  res.json({ request: newRequest, readiness });
});

// 3. Get single financing request
router.get('/financing-requests/:id', (req, res) => {
  const request = db.getFinancingRequestById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  const snapshots = db.getFinanceReadinessSnapshots(request.id);
  const latestReadiness = snapshots[snapshots.length - 1];
  res.json({ request, latestReadiness });
});

// 4. Update financing request
router.patch('/financing-requests/:id', (req, res) => {
  const updated = db.updateFinancingRequest(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Request not found' });
  res.json(updated);
});

// 5. Evaluate/Refresh Finance Readiness Score
router.post('/financing-requests/:id/readiness', (req, res) => {
  const request = db.getFinancingRequestById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const project = db.getProjectById(request.projectId);
  const models = db.getFinancialModelsByProjectId(request.projectId);
  const activeModel = models.find((m: any) => m.status !== 'SUPERSEDED') || models[0];
  const contracts = db.getProjectContracts ? db.getProjectContracts(request.projectId) : [];
  const docs = db.getProjectDocuments ? db.getProjectDocuments(request.projectId) : [];

  const snapshot = financeReadinessService.evaluateReadiness(request, project, activeModel, contracts.length, docs.length);
  db.createFinanceReadinessSnapshot(snapshot);
  db.updateFinancingRequest(request.id, { readinessScore: snapshot.totalScore, status: 'READY' });

  res.json(snapshot);
});

// 6. Get/Run Financial Partner Matching
router.get('/financing-requests/:id/matches', (req, res) => {
  const request = db.getFinancingRequestById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const project = db.getProjectById(request.projectId);
  const partners = db.getFinancialPartnerProfiles();
  const products = db.getFinancingProducts();

  const matches = financialPartnerMatchingService.matchRequestWithPartners(request, project, partners, products);
  db.saveFinancialPartnerMatches(request.id, matches);

  // Return matches joined with partner profile
  const enrichedMatches = matches.map(m => {
    const partner = partners.find(p => p.id === m.financialPartnerProfileId);
    const product = products.find(p => p.id === m.financingProductId);
    return { ...m, partner, product };
  });

  res.json(enrichedMatches);
});

// 7. Submit Financing Request to a selected Partner
router.post('/financing-requests/:id/submit-to-partner', (req, res) => {
  const request = db.getFinancingRequestById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const { financialPartnerProfileId, authorizedDocumentIds, message } = req.body;
  if (!financialPartnerProfileId) {
    return res.status(400).json({ error: 'financialPartnerProfileId is required' });
  }

  const partner = db.getFinancialPartnerProfileById(financialPartnerProfileId);
  if (!partner) return res.status(404).json({ error: 'Financial partner not found' });

  const submission = db.createFinancingSubmission({
    financingRequestId: request.id,
    financialPartnerProfileId,
    status: 'SUBMITTED',
    authorizedDocumentIds: authorizedDocumentIds || [],
    message: message || `ارسال پرونده تأمین مالی پروژه ${request.requestCode}`
  });

  // Update request status to SUBMITTED
  db.updateFinancingRequest(request.id, { status: 'SUBMITTED', submittedAt: new Date().toISOString() });

  // Update project status if transition is valid
  const project = db.getProjectById(request.projectId);
  if (project && (project.status === 'CONTRACTING' || project.status === 'EPC_SELECTED')) {
    if (canTransition(project.status, 'FINANCING')) {
      db.updateProject(project.id, { status: 'FINANCING' });
    }
  }

  res.json({ submission, requestStatus: 'SUBMITTED' });
});

// 8. Financial Partners Directory (all active profiles)
router.get('/financial-partners', (req, res) => {
  const partners = db.getFinancialPartnerProfiles();
  const products = db.getFinancingProducts();
  const enriched = partners.map(p => ({
    ...p,
    products: products.filter(prod => prod.financialPartnerProfileId === p.id)
  }));
  res.json(enriched);
});

// 9. Partner Dashboard: list submissions for partner
router.get('/financial-partners/requests', (req, res) => {
  const partnerId = req.query.partnerId as string;
  const allSubmissions = db.getFinancingSubmissions();
  const submissions = partnerId ? allSubmissions.filter((s: any) => s.financialPartnerProfileId === partnerId) : allSubmissions;

  const enriched = submissions.map((sub: any) => {
    const request = db.getFinancingRequestById(sub.financingRequestId);
    const project = request ? db.getProjectById(request.projectId) : null;
    const infoRequests = db.getFinanceInformationRequests(sub.id);
    const offers = request ? db.getFinancingOffers(request.id).filter((o: any) => o.financialPartnerProfileId === sub.financialPartnerProfileId) : [];
    return {
      submission: sub,
      request,
      project,
      infoRequestsCount: infoRequests.length,
      offersCount: offers.length
    };
  });

  res.json(enriched);
});

// 10. Partner Request Details with authorized data room
router.get('/financial-partners/requests/:submissionId', (req, res) => {
  const submission = db.getFinancingSubmissionById(req.params.submissionId);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  // Mark viewed if not already
  if (!submission.viewedAt) {
    db.updateFinancingSubmission(submission.id, { viewedAt: new Date().toISOString(), status: 'UNDER_REVIEW' });
  }

  const request = db.getFinancingRequestById(submission.financingRequestId);
  const project = request ? db.getProjectById(request.projectId) : null;
  const snapshots = request ? db.getFinanceReadinessSnapshots(request.id) : [];
  const readiness = snapshots[snapshots.length - 1];
  
  // Authorized documents only
  const allDocs = (project && db.getProjectDocuments) ? db.getProjectDocuments(project.id) : [];
  const authorizedDocs = allDocs.filter((d: any) => submission.authorizedDocumentIds.includes(d.id));

  const infoRequests = db.getFinanceInformationRequests(submission.id);
  const notes = db.getFinanceReviewNotes(submission.id);
  const offers = request ? db.getFinancingOffers(request.id).filter((o: any) => o.financialPartnerProfileId === submission.financialPartnerProfileId) : [];

  res.json({
    submission,
    request,
    project,
    readiness,
    authorizedDocuments: authorizedDocs,
    informationRequests: infoRequests,
    notes,
    offers
  });
});

// 11. Partner requests more information
router.post('/financial-partners/requests/:submissionId/request-info', (req, res) => {
  const submission = db.getFinancingSubmissionById(req.params.submissionId);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  const infoReq = db.createFinanceInformationRequest({
    financingSubmissionId: submission.id,
    requestedByUserId: req.body.requestedByUserId || 'partner-agent',
    title: req.body.title || 'درخواست مستندات تکمیلی پرونده اعتباری',
    description: req.body.description || '',
    requiredDocumentTypes: req.body.requiredDocumentTypes || [],
    dueDate: req.body.dueDate
  });

  db.updateFinancingSubmission(submission.id, { status: 'MORE_INFO_REQUESTED' });
  const request = db.getFinancingRequestById(submission.financingRequestId);
  if (request) {
    db.updateFinancingRequest(request.id, { status: 'ADDITIONAL_INFO_REQUIRED' });
  }

  res.json(infoReq);
});

// 12. Partner submits a Financing Offer
router.post('/financial-partners/requests/:submissionId/offers', (req, res) => {
  const submission = db.getFinancingSubmissionById(req.params.submissionId);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  const request = db.getFinancingRequestById(submission.financingRequestId);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const offeredAmount = req.body.offeredAmount || request.requestedAmount;
  const interestRate = req.body.interestRate !== undefined ? req.body.interestRate : 23;
  const tenorMonths = req.body.tenorMonths || request.requestedTenorMonths || 48;
  const gracePeriodMonths = req.body.gracePeriodMonths !== undefined ? req.body.gracePeriodMonths : request.preferredGracePeriodMonths || 6;
  const repaymentType = req.body.repaymentType || request.repaymentPreference || 'EQUAL_INSTALLMENT';

  const offer = db.createFinancingOffer({
    financingRequestId: request.id,
    financialPartnerProfileId: submission.financialPartnerProfileId,
    financingProductId: req.body.financingProductId,
    status: req.body.status || 'SUBMITTED',
    offeredAmount,
    interestRateType: req.body.interestRateType || 'FIXED',
    interestRate,
    tenorMonths,
    gracePeriodMonths,
    repaymentType,
    fees: req.body.fees || [
      { id: 'fee-1', type: 'PROCESSING_FEE', amount: 50000000, currency: 'IRR', description: 'کارمزد کارشناسی و ارزیابی فنی و اعتباری' }
    ],
    collateralRequirements: req.body.collateralRequirements || ['توثیق اسناد رسمی ملک محل اجرای طرح', 'سفته معتبر با امضای ضامنین'],
    conditionsPrecedent: req.body.conditionsPrecedent || ['اخذ تاییدیه نهایی اتصال به شبکه از توزیع برق', 'ثبت و ارائه قرارداد رسمی EPC'],
    notes: req.body.notes || 'پیشنهاد اولیه تسهیلات احداث نیروگاه خورشیدی'
  });

  db.updateFinancingSubmission(submission.id, { status: 'OFFER_RECEIVED' });
  db.updateFinancingRequest(request.id, { status: 'OFFERS_RECEIVED' });

  res.json(offer);
});

// 13. Get all offers for a financing request
router.get('/financing-requests/:id/offers', (req, res) => {
  const offers = db.getFinancingOffers(req.params.id);
  const partners = db.getFinancialPartnerProfiles();
  const enriched = offers.map((o: any) => ({
    ...o,
    partner: partners.find(p => p.id === o.financialPartnerProfileId)
  }));
  res.json(enriched);
});

// 14. Compare all offers for a financing request
router.get('/financing-requests/:id/compare-offers', (req, res) => {
  const request = db.getFinancingRequestById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const offers = db.getFinancingOffers(request.id);
  const partners = db.getFinancialPartnerProfiles();

  const comparisons = offers.map((offer: any) => {
    const summary = financingOfferComparisonService.enrichAndScoreOffer(offer, request);
    const partner = partners.find(p => p.id === offer.financialPartnerProfileId);
    return { ...summary, partner };
  }).sort((a: any, b: any) => b.comparisonScore - a.comparisonScore);

  res.json(comparisons);
});

// 15. Owner selects preferred offer
router.post('/financing-offers/:id/select', (req, res) => {
  const offer = db.getFinancingOfferById(req.params.id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  const request = db.getFinancingRequestById(offer.financingRequestId);
  if (!request) return res.status(404).json({ error: 'Financing request not found' });

  // Update this offer to SELECTED
  db.updateFinancingOffer(offer.id, { status: 'SELECTED' });

  // Update request to OFFER_SELECTED
  db.updateFinancingRequest(request.id, { status: 'OFFER_SELECTED' });

  // Mark other offers as DECLINED
  const otherOffers = db.getFinancingOffers(request.id).filter((o: any) => o.id !== offer.id);
  otherOffers.forEach((o: any) => {
    db.updateFinancingOffer(o.id, { status: 'DECLINED' });
  });

  res.json({ success: true, selectedOfferId: offer.id, status: 'OFFER_SELECTED' });
});

// 16. Record partner final approval and create Project Financing Record
router.post('/financing-offers/:id/record-partner-approval', (req, res) => {
  const offer = db.getFinancingOfferById(req.params.id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  const request = db.getFinancingRequestById(offer.financingRequestId);
  if (!request) return res.status(404).json({ error: 'Financing request not found' });

  // Update offer and request status
  db.updateFinancingOffer(offer.id, { status: 'FINAL' });
  db.updateFinancingRequest(request.id, { status: 'APPROVED_BY_PARTNER' });

  // Create Project Financing Record
  const financingRecord = db.createProjectFinancingRecord({
    projectId: request.projectId,
    financingRequestId: request.id,
    financingOfferId: offer.id,
    financialPartnerProfileId: offer.financialPartnerProfileId,
    status: 'APPROVED',
    approvedAmount: offer.offeredAmount,
    currency: 'IRR',
    interestRate: offer.interestRate,
    tenorMonths: offer.tenorMonths,
    gracePeriodMonths: offer.gracePeriodMonths,
    repaymentType: offer.repaymentType,
    effectiveDate: new Date().toISOString()
  });

  // Transition project from FINANCING to PROCUREMENT if permissible
  const project = db.getProjectById(request.projectId);
  if (project && project.status === 'FINANCING') {
    if (canTransition(project.status, 'PROCUREMENT')) {
      db.updateProject(project.id, { status: 'PROCUREMENT' });
    }
  }

  res.json({ success: true, financingRecord, projectStatus: project?.status });
});

// 17. Get project financing summary
router.get('/projects/:projectId/financing', (req, res) => {
  const projectId = req.params.projectId;
  const records = db.getProjectFinancingRecords(projectId);
  const requests = db.getFinancingRequests(projectId);
  const activeRecord = records[records.length - 1];
  const activeRequest = requests[requests.length - 1];

  let partner = null;
  if (activeRecord) {
    partner = db.getFinancialPartnerProfileById(activeRecord.financialPartnerProfileId);
  }

  res.json({
    activeRecord,
    activeRequest,
    partner,
    allRecords: records
  });
});

export default router;
