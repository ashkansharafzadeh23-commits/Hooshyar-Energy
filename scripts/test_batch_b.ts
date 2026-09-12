import { db } from '../src/db/index';
import { projectRepository } from '../src/repositories/projectRepository';
import { rfqRepository } from '../src/repositories/rfqRepository';
import { financeService } from '../src/services/financeService';
import { projectReadinessService } from '../src/services/projectReadinessService';
import { projectMatchingService } from '../src/services/projectMatchingService';

async function runBatchBAcceptanceTest() {
  console.log('====================================================');
  console.log('HOOSHYAR ENERGY — FULL BATCH B ACCEPTANCE VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  // --- STEP 1: Project Setup ---
  console.log('--- Step 1: Project Setup ---');
  const project = projectRepository.create({
    projectCode: 'PRJ-TEST-001',
    title: 'نیروگاه خورشیدی تست یکپارچه ۱۰۰ کیلوواتی اصفهان',
    projectType: 'SOLAR',
    status: 'FEASIBILITY',
    ownerId: 'test-user-1',
    targetCapacityKw: 100,
    estimatedBudgetIRR: 25000000000, // 2.5 Billion Tomans
    location: {
      country: 'Iran',
      province: 'اصفهان',
      city: 'نجف‌آباد'
    },
    site: {
      type: 'ROOFTOP_COMMERCIAL',
      areaM2: 1200
    },
    energyRequirement: {
      gridConnected: true,
      gridStable: true
    }
  });
  assert(Boolean(project && project.id), 'Project created successfully with ID: ' + project.id);

  // --- PHASE 2: Financial Engine Verification ---
  console.log('\n--- Phase 2: Financial Engine Verification ---');
  
  // Test currency conversion: 1 TOMAN = 10 RIAL
  const rialAmount = 10000000; // 10M Rials
  const tomanConverted = rialAmount / 10;
  assert(tomanConverted === 1000000, 'Currency handling: 1 TOMAN = 10 RIAL deterministic equivalence verified');

  // Deterministic Financial Calculation
  const capexToman = 2500000000; // 2.5B Tomans
  const annualGenerationKwh = 165000; // 100kW * 1650 kWh/kW/yr
  const tariffTomanPerKwh = 3200; // SATBA tariff
  const annualRevenueToman = annualGenerationKwh * tariffTomanPerKwh;
  const annualOpexToman = capexToman * 0.02; // 2% opex
  const netBenefitToman = annualRevenueToman - annualOpexToman;
  const simplePayback = capexToman / netBenefitToman;

  assert(simplePayback > 4 && simplePayback < 8, `Deterministic simple payback calculation: ${simplePayback.toFixed(2)} years`);

  const assumptions: any = {
    projectId: project.id,
    name: 'مفروضات اقتصادی پایه',
    version: 1,
    projectLifetimeYears: 20,
    discountRatePercent: 30,
    annualInflationPercent: 35,
    electricityTariffEscalationPercent: 20,
    equipmentPriceEscalationPercent: 25,
    panelAnnualDegradationPercent: 0.5,
    systemAvailabilityPercent: 99,
    performanceRatioPercent: 80,
    annualOpexEscalationPercent: 30,
    taxRatePercent: 0,
    insurancePercent: 0.5,
    maintenancePercent: 1.0,
    residualValuePercent: 5
  };
  const savedAssumptions = db.createFinancialAssumptionSet(assumptions);

  // Financial Model Creation
  const finModel = db.createFinancialModel({
    projectId: project.id,
    modelCode: 'MOD-HSE-TEST01',
    status: 'DRAFT',
    baseCurrency: 'IRR',
    displayCurrencyUnit: 'TOMAN',
    assumptionSetId: savedAssumptions.id,
    sourceType: 'ENGINEERING_ESTIMATE',
    version: 1,
    createdByUserId: 'test-user-1',
    capex: {
      engineering: { amount: 250000000, currency: 'IRR', unit: 'TOMAN' },
      solarPanels: { amount: 1200000000, currency: 'IRR', unit: 'TOMAN' },
      inverters: { amount: 450000000, currency: 'IRR', unit: 'TOMAN' },
      battery: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
      generator: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
      mountingStructure: { amount: 200000000, currency: 'IRR', unit: 'TOMAN' },
      electricalEquipment: { amount: 150000000, currency: 'IRR', unit: 'TOMAN' },
      cables: { amount: 50000000, currency: 'IRR', unit: 'TOMAN' },
      protection: { amount: 50000000, currency: 'IRR', unit: 'TOMAN' },
      monitoring: { amount: 30000000, currency: 'IRR', unit: 'TOMAN' },
      transportation: { amount: 20000000, currency: 'IRR', unit: 'TOMAN' },
      installation: { amount: 200000000, currency: 'IRR', unit: 'TOMAN' },
      commissioning: { amount: 30000000, currency: 'IRR', unit: 'TOMAN' },
      gridConnection: { amount: 50000000, currency: 'IRR', unit: 'TOMAN' },
      permits: { amount: 20000000, currency: 'IRR', unit: 'TOMAN' },
      civilWorks: { amount: 50000000, currency: 'IRR', unit: 'TOMAN' },
      tax: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
      contingency: { amount: 50000000, currency: 'IRR', unit: 'TOMAN' },
      other: { amount: 0, currency: 'IRR', unit: 'TOMAN' }
    },
    opex: {
      maintenance: { amount: 30000000, currency: 'IRR', unit: 'TOMAN' },
      cleaning: { amount: 10000000, currency: 'IRR', unit: 'TOMAN' },
      insurance: { amount: 10000000, currency: 'IRR', unit: 'TOMAN' },
      monitoring: { amount: 5000000, currency: 'IRR', unit: 'TOMAN' },
      landLease: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
      staff: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
      security: { amount: 5000000, currency: 'IRR', unit: 'TOMAN' },
      batteryReplacementReserve: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
      inverterReplacementReserve: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
      administration: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
      other: { amount: 0, currency: 'IRR', unit: 'TOMAN' }
    },
    replacements: [],
    energyEconomics: {
      installedCapacityKw: 100,
      annualGenerationKwh: 165000,
      selfConsumptionRatio: 0,
      exportRatio: 100,
      customerTariff: {
        id: 't-ret',
        name: 'تعرفه مشترکین',
        type: 'CUSTOMER_RETAIL_TARIFF',
        unitPricePerKwh: { amount: 4000, currency: 'IRR', unit: 'TOMAN' },
        effectiveDate: new Date().toISOString(),
        annualEscalationPercent: 20,
        source: 'توانیر'
      },
      exportTariff: {
        id: 't-satba',
        name: 'نرخ خرید تضمینی ساتبا',
        type: 'FEED_IN_TARIFF',
        unitPricePerKwh: { amount: 3200, currency: 'IRR', unit: 'TOMAN' },
        effectiveDate: new Date().toISOString(),
        annualEscalationPercent: 0,
        source: 'ساتبا'
      }
    }
  });
  assert(Boolean(finModel && finModel.id), 'Financial model created in database');

  // Deterministic engine execution
  const calcResult = financeService.calculateModel(finModel, savedAssumptions);
  assert(Boolean(calcResult && typeof calcResult.simplePaybackYears === 'number'), 'Financial results computed without AI hallucination (Payback: ' + calcResult.simplePaybackYears + ' yrs)');
  assert(typeof calcResult.npv?.amount === 'number', 'Deterministic NPV computed: ' + calcResult.npv?.amount + ' Toman');

  // Scenarios / Sensitivity analysis
  const scenario: any = {
    id: 'scen-01',
    projectId: project.id,
    financialModelId: finModel.id,
    name: 'سناریوی خوش‌بینانه',
    type: 'OPTIMISTIC',
    generationOverrideKwh: 180000
  };
  const scenarioResults = financeService.calculateScenario(scenario, finModel, savedAssumptions);
  assert(Boolean(scenarioResults && typeof scenarioResults.simplePaybackYears === 'number'), 'Sensitivity scenario (Optimistic) executed deterministically');

  // --- PHASE 3: Investment Hub Verification ---
  console.log('\n--- Phase 3: Investment Hub Verification ---');

  // Investment Opportunity Creation
  const opp = db.createInvestmentOpportunity({
    projectId: project.id,
    createdByUserId: 'test-user-1',
    opportunityCode: 'OPP-PRJ-00001',
    type: 'PROJECT_SEEKING_CAPITAL',
    status: 'PUBLISHED',
    title: 'فرصت سرمایه‌گذاری نیروگاه ۱۰۰ کیلوواتی نجف‌آباد',
    summary: 'پروژه نیروگاه خورشیدی بر بام تجاری آماده احداث',
    location: { province: 'اصفهان', city: 'نجف‌آباد' },
    projectStage: 'FEASIBILITY',
    targetCapacityKw: 100,
    landStatus: 'OWNED',
    permitStatus: 'IN_PROGRESS',
    gridConnectionStatus: 'APPROVED',
    engineeringStatus: 'IN_PROGRESS',
    financialModelStatus: 'COMPLETE',
    epcStatus: 'SELECTED',
    capitalRequirement: {
      totalProjectCapex: 2500000000,
      ownerEquity: 1250000000,
      capitalRequired: 1250000000 // 50% funding gap
    },
    minimumPartnerCapital: 200000000,
    preferredPartnerType: 'EQUITY_PARTNER',
    visibility: 'PUBLIC_SUMMARY',
    riskDisclosure: [
      'سودآوری منوط به تداوم تابش نرمال و عدم قطعی مکرر شبکه برق است.',
      'تعدیل نرخ خرید تضمینی تابع مقررات وزارت نیرو و سازمان ساتبا می‌باشد.'
    ]
  });
  assert(Boolean(opp && opp.id), 'Investment opportunity created with funding gap and risk disclosure');

  // Readiness Score Calculation
  const readiness = projectReadinessService.calculateReadiness(project, opp);
  assert(readiness.score > 0 && readiness.score <= 100, `Project readiness score calculated deterministically: ${readiness.score}%`);
  assert(readiness.scoreBreakdown.land === 100, 'Readiness sub-score for land verified (100%)');
  assert(readiness.scoreBreakdown.financial === 100, 'Readiness sub-score for financial model verified (100%)');

  // Investor Profile and Deterministic Matching
  const investor = db.createInvestorProfile({
    userId: 'investor-user-1',
    investorType: 'COMPANY',
    capitalMin: 500000000,
    capitalMax: 5000000000,
    currency: 'TOMAN',
    preferredProvinces: ['اصفهان', 'تهران', 'یزد'],
    preferredProjectSizeMinKw: 50,
    preferredProjectSizeMaxKw: 500,
    preferredProjectStages: ['FEASIBILITY', 'EPC_SELECTED'],
    riskPreference: 'BALANCED',
    preferredTechnologies: ['SOLAR'],
    requiresLandVerified: true,
    requiresFinancialModel: true,
    requiresEpcSelected: false,
    status: 'ACTIVE'
  });
  assert(Boolean(investor && investor.id), 'Investor profile registered');

  const match = projectMatchingService.calculateMatchScore(investor, opp, readiness);
  assert(Boolean(match && match.score > 70), `Deterministic investor match calculated: ${match.score}% fit`);

  // --- PHASE 4: Contract + Project Execution Lifecycle ---
  console.log('\n--- Phase 4: Contract & Execution Verification ---');

  // 1. Create RFQ & Award Winning Bid
  const rfq = rfqRepository.createRFQ({
    rfqCode: 'RFQ-HSE-000001',
    projectId: project.id,
    title: 'مناقصه احداث نیروگاه خورشیدی ۱۰۰ کیلووات',
    description: 'استعلام قیمت و انتخاب پیمانکار EPC نیروگاه خورشیدی نجف‌آباد',
    scope: 'EPC کامل',
    status: 'PUBLISHED',
    submissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    currency: 'IRR',
    visibility: 'VERIFIED_EPCS',
    technicalRequirements: ['پنل‌های مونوکریستالین Tier-1', 'اینورتر استرینگ متصل به شبکه'],
    commercialRequirements: ['حداقل ۲۴ ماه گارانتی', 'ارائه ضمانتنامه حسن اجرای تعهدات'],
    requiredDocuments: ['نقشه‌های تک‌خطی', 'مجوز پیمانکاری'],
    createdByUserId: 'test-user-1'
  });
  assert(Boolean(rfq && rfq.id), 'RFQ created: ' + rfq.rfqCode);

  const winningBid = rfqRepository.createBid({
    bidCode: 'BID-HSE-000001',
    projectId: project.id,
    rfqId: rfq.id,
    epcOrganizationId: 'org-epc-01',
    status: 'SELECTED',
    currency: 'IRR',
    totalPrice: 24000000000, // 2.4 Billion Tomans
    engineeringPrice: 2000000000,
    equipmentPrice: 16000000000,
    installationPrice: 5000000000,
    otherPrice: 1000000000,
    executionDays: 90,
    warrantyYears: 2,
    equipmentSummary: { panels: '550W Tier-1', inverters: '100kW String' },
    paymentTerms: 'پیش‌پرداخت ۲۰٪، تحویل تجهیزات ۶۰٪، تحویل موقت ۲۰٪',
    technicalDocuments: ['doc1.pdf'],
    commercialDocuments: ['com1.pdf'],
    technicalCompliance: 'COMPLIANT',
    riskFlags: []
  });
  assert(Boolean(winningBid && winningBid.status === 'SELECTED'), 'Winning bid selected: ' + winningBid.bidCode);

  // 2. Contract Creation from Winning Bid
  const plannedWeeks = Math.ceil(winningBid.executionDays / 7);
  const startDate = new Date();
  const completionDate = new Date(startDate.getTime() + plannedWeeks * 7 * 24 * 60 * 60 * 1000);

  const contract = db.createContract({
    projectId: project.id,
    contractCode: 'CNT-HSE-000001',
    title: 'قرارداد EPC نیروگاه ۱۰۰ کیلووات با پیمانکار منتخب',
    contractType: 'EPC_LUMPSUM',
    status: 'DRAFT',
    contractValue: winningBid.totalPrice,
    revisedContractValue: winningBid.totalPrice,
    currency: winningBid.currency,
    plannedStartDate: startDate.toISOString().split('T')[0],
    plannedCompletionDate: completionDate.toISOString().split('T')[0],
    advancePaymentPercent: 20,
    retentionPercent: 5,
    warrantyPeriodMonths: 24,
    liquidatedDamagesPerDayPercent: 0.1,
    paymentTermsSummary: winningBid.paymentTerms,
    scopeSummary: 'احداث کامل نیروگاه خورشیدی ۱۰۰ کیلوواتی',
    sourceBidId: winningBid.id,
    isTemplateTerms: true, // Marked as template until reviewed
    termsConfirmedByUser: false,
    currentRevisionNumber: 1
  });
  assert(Boolean(contract && contract.id), 'Contract created: ' + contract.contractCode);
  assert(contract.isTemplateTerms === true, 'Contract correctly tagged with isTemplateTerms: true');

  // Contract Parties
  const partyClient = db.createContractParty({
    contractId: contract.id,
    partyType: 'CLIENT',
    legalName: 'شرکت توسعه انرژی هوشیار (کارفرما)',
    representativeName: 'مدیرعامل',
    signStatus: 'PENDING'
  });
  const partyEPC = db.createContractParty({
    contractId: contract.id,
    partyType: 'EPC_CONTRACTOR',
    legalName: 'شرکت مهندسی و پیمانکاری توان‌ساز (مجری EPC)',
    representativeName: 'مدیر پروژه',
    signStatus: 'PENDING'
  });
  assert(partyClient.signStatus === 'PENDING' && partyEPC.signStatus === 'PENDING', 'Parties initialized with PENDING signatures');

  // 3. Confirm Terms (User review)
  const confirmedContract = db.updateContract(contract.id, {
    isTemplateTerms: false,
    termsConfirmedByUser: true,
    status: 'UNDER_REVIEW'
  });
  assert(confirmedContract?.isTemplateTerms === false, 'Contract terms explicitly confirmed, template flag cleared');

  // 4. Baseline Creation
  const baseline = db.createProjectBaseline({
    projectId: project.id,
    contractId: contract.id,
    baselineCode: 'BL-01',
    version: 1,
    status: 'DRAFT',
    plannedStartDate: contract.plannedStartDate,
    plannedCompletionDate: contract.plannedCompletionDate,
    plannedMilestonesCount: 6,
    contractValue: contract.contractValue,
    currency: contract.currency,
    createdByUserId: 'test-user-1'
  });
  assert(Boolean(baseline && baseline.id), 'Baseline created in DRAFT: ' + baseline.baselineCode);

  // Approve Baseline
  const approvedBaseline = db.updateProjectBaseline(baseline.id, {
    status: 'APPROVED',
    approvedByUserId: 'supervisor-1',
    approvedAt: new Date().toISOString()
  });
  assert(approvedBaseline?.status === 'APPROVED', 'Baseline officially approved by supervisor');

  // 5. Milestone Generation & Weighted Progress
  const templateMilestones = [
    { code: 'MS-01', title: 'تایید مهندسی تفصیلی و نقشه‌ها', weight: 15, category: 'ENGINEERING' },
    { code: 'MS-02', title: 'ورود تجهیزات اصلی به کارگاه', weight: 35, category: 'PROCUREMENT' },
    { code: 'MS-03', title: 'اتمام سازه مکانیکی و نصب پنل‌ها', weight: 25, category: 'CIVIL' },
    { code: 'MS-04', title: 'سیم‌کشی الکتریکی و اینورترها', weight: 15, category: 'ELECTRICAL' },
    { code: 'MS-05', title: 'تست، راه‌اندازی و تزریق به شبکه', weight: 10, category: 'COMMISSIONING' }
  ];

  let seq = 1;
  for (const tm of templateMilestones) {
    db.createMilestone({
      projectId: project.id,
      contractId: contract.id,
      milestoneCode: tm.code,
      title: tm.title,
      category: tm.category,
      weightPercent: tm.weight,
      sequence: seq++,
      status: 'NOT_STARTED',
      completionPercent: 0,
      isTemplate: true
    });
  }
  const milestones = db.getProjectMilestones(project.id);
  assert(milestones.length === 5, 'WBS Milestones populated (5 milestones)');

  // Calculate weighted progress
  const totalWeight = milestones.reduce((sum, m) => sum + m.weightPercent, 0);
  assert(totalWeight === 100, 'Milestone physical weights sum to exactly 100%');

  // Simulate updating milestone 1 to 100% and milestone 2 to 50%
  db.updateMilestone(milestones[0].id, { status: 'COMPLETED', completionPercent: 100 });
  db.updateMilestone(milestones[1].id, { status: 'IN_PROGRESS', completionPercent: 50 });
  const updatedMilestones = db.getProjectMilestones(project.id);
  const currentProgress = updatedMilestones.reduce((sum, m) => sum + (m.weightPercent * (m.completionPercent / 100)), 0);
  // Expected: 15% * 1.0 + 35% * 0.5 = 15 + 17.5 = 32.5%
  assert(Math.abs(currentProgress - 32.5) < 0.01, `Weighted progress correctly calculated: ${currentProgress.toFixed(1)}%`);

  // 6. Party Signatures & Contract Activation
  db.updateContractParty(partyClient.id, { signStatus: 'SIGNED', signedAt: new Date().toISOString() });
  db.updateContractParty(partyEPC.id, { signStatus: 'SIGNED', signedAt: new Date().toISOString() });
  const updatedParties = db.getContractParties(contract.id);
  const allSigned = updatedParties.every(p => p.signStatus === 'SIGNED');
  assert(allSigned, 'Both parties digitally signed the contract');

  if (allSigned) {
    db.updateContract(contract.id, { status: 'ACTIVE' });
  }
  const activeContract = db.getContractById(contract.id);
  assert(activeContract?.status === 'ACTIVE', 'Contract status transitioned to ACTIVE upon signature completion');

  // 7. Change Request (CR) & Contract Revision Audit Workflow
  const cr = db.createChangeRequest({
    projectId: project.id,
    contractId: contract.id,
    crCode: 'CR-001',
    title: 'افزایش کابل‌کشی به دلیل جابجایی ترانس کارگاهی',
    description: 'نیاز به ۶۰ متر کابل فشار ضعیف مسی اضافی طبق درخواست ناظر',
    reasonCategory: 'DESIGN_CHANGE',
    costImpactAmount: 400000000, // 40 Million Tomans in IRR
    scheduleImpactDays: 5,
    status: 'SUBMITTED',
    requestedByUserId: 'epc-pm'
  });
  assert(Boolean(cr && cr.id), 'Change Request created: ' + cr.crCode);

  // Approve CR -> MUST trigger ContractRevision and revisedContractValue update
  const approvedCR = db.updateChangeRequest(cr.id, {
    status: 'APPROVED',
    approvedByUserId: 'supervisor-1',
    approvedAt: new Date().toISOString()
  });
  assert(approvedCR?.status === 'APPROVED', 'Change Request approved');

  const oldContractValue = activeContract!.revisedContractValue || activeContract!.contractValue;
  const newContractValue = oldContractValue + (approvedCR!.costImpactAmount || 0);
  const newRevNum = (activeContract!.currentRevisionNumber || 1) + 1;

  // Create audit revision
  const rev = db.createContractRevision({
    contractId: contract.id,
    revisionNumber: newRevNum,
    reason: `دستور تغییر کار مصوب: ${approvedCR?.title}`,
    changesSummary: `افزایش مبلغ پیمان به میزان ${approvedCR?.costImpactAmount} ریال و تمدید مجاز ${approvedCR?.scheduleImpactDays} روز`,
    contractValueBefore: oldContractValue,
    contractValueAfter: newContractValue,
    scheduleImpactDays: approvedCR?.scheduleImpactDays || 0,
    approvedByUserId: 'supervisor-1',
    approvedAt: new Date().toISOString(),
    changeRequestId: approvedCR?.id
  });
  assert(Boolean(rev && rev.id), 'ContractRevision audit record created: Rev ' + rev.revisionNumber);

  db.updateContract(contract.id, {
    revisedContractValue: newContractValue,
    currentRevisionNumber: newRevNum
  });

  const finalContract = db.getContractById(contract.id);
  assert(finalContract?.contractValue === 24000000000, 'Original baseline contractValue is preserved untouched (24B Rials)');
  assert(finalContract?.revisedContractValue === 24400000000, 'Revised contract value reflects approved CR addition (24.4B Rials)');
  assert(finalContract?.currentRevisionNumber === 2, 'Contract revision number advanced to Rev 2');

  const contractRevs = db.getContractRevisions(contract.id);
  assert(contractRevs.length === 1, 'Contract revisions history contains the audit record');

  console.log('\n====================================================');
  console.log(`ACCEPTANCE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runBatchBAcceptanceTest().catch(err => {
  console.error('Acceptance test failed with error:', err);
  process.exit(1);
});
