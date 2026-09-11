import { MoneyAmount } from './finance.js';

export type FinancialPartnerType = 
  | 'BANK'
  | 'CREDIT_INSTITUTION'
  | 'LEASING_COMPANY'
  | 'INVESTMENT_FUND'
  | 'ENERGY_FUND'
  | 'CORPORATE_FINANCIER'
  | 'EQUIPMENT_FINANCIER'
  | 'DEVELOPMENT_FINANCE'
  | 'OTHER';

export type PartnerVerificationStatus = 
  | 'NOT_REVIEWED'
  | 'PENDING'
  | 'BASIC_VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface FinancialPartnerProfile {
  id: string;
  organizationId?: string;
  partnerType: FinancialPartnerType;
  displayName: string;
  status: 'ACTIVE' | 'INACTIVE';
  verificationStatus: PartnerVerificationStatus;
  supportedFinancingProducts: FinancingProductType[];
  minimumFinancingAmount: number; // in Rials
  maximumFinancingAmount: number; // in Rials
  currency: 'IRR';
  supportedProjectTypes: string[];
  supportedTechnologies: string[];
  supportedProvinces: string[];
  minimumProjectReadiness: number; // 0-100
  minimumEquityContributionPercent?: number;
  minimumDSCR?: number;
  maximumTenorMonths?: number;
  collateralPreferences: string[];
  requiredDocuments: string[];
  contactWorkflow?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FinancingProductType = 
  | 'PROJECT_LOAN'
  | 'EQUIPMENT_FINANCE'
  | 'LEASING'
  | 'WORKING_CAPITAL'
  | 'BRIDGE_FINANCE'
  | 'CONSTRUCTION_FINANCE'
  | 'GREEN_FINANCE'
  | 'RECEIVABLE_FINANCE'
  | 'PPA_BACKED_FINANCE'
  | 'OTHER';

export interface FinancingProduct {
  id: string;
  financialPartnerProfileId: string;
  name: string;
  type: FinancingProductType;
  status: 'ACTIVE' | 'INACTIVE';
  currency: 'IRR';
  minimumAmount: number;
  maximumAmount: number;
  minimumTenorMonths: number;
  maximumTenorMonths: number;
  interestRateType: 'FIXED' | 'VARIABLE' | 'PARTNER_DECLARED';
  indicativeMinimumRate?: number; // percent
  indicativeMaximumRate?: number; // percent
  gracePeriodAvailable: boolean;
  maxGracePeriodMonths?: number;
  collateralRequired: boolean;
  minimumEquityPercent?: number;
  eligibleProjectStages: string[];
  eligibleTechnologies: string[];
  eligibleRegions: string[];
  requiredDocuments: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type FinancingRequestStatus = 
  | 'DRAFT'
  | 'READINESS_REVIEW'
  | 'READY'
  | 'MATCHING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'OFFERS_RECEIVED'
  | 'OFFER_SELECTED'
  | 'PARTNER_DUE_DILIGENCE'
  | 'CONDITIONAL_APPROVAL'
  | 'APPROVED_BY_PARTNER'
  | 'REJECTED_BY_PARTNER'
  | 'WITHDRAWN'
  | 'CLOSED';

export interface FinancingRequest {
  id: string;
  requestCode: string; // e.g. FIN-HSE-000001
  projectId: string;
  requesterUserId: string;
  requesterOrganizationId?: string;
  financialModelId?: string;
  selectedScenarioId?: string;
  status: FinancingRequestStatus;
  financingType: FinancingProductType;
  requestedAmount: number; // in Rials
  currency: 'IRR';
  totalProjectCost: number; // CAPEX in Rials
  ownerEquity: number; // Sponsor Equity in Rials
  securedCapital: number; // Existing secured capital in Rials
  existingDebt: number; // Existing loans in Rials
  fundingGap: number; // totalProjectCost - (ownerEquity + securedCapital)
  requestedTenorMonths: number;
  preferredGracePeriodMonths: number;
  repaymentPreference: 'EQUAL_INSTALLMENT' | 'EQUAL_PRINCIPAL' | 'BULLET' | 'CUSTOM';
  collateralAvailable: boolean;
  collateralSummary?: string;
  projectRevenueModel: 'SELF_CONSUMPTION' | 'GRID_EXPORT' | 'PPA' | 'MIXED' | 'BACKUP_VALUE' | 'OTHER';
  targetFinancingDate?: string;
  summary: string;
  readinessScore?: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export type FinanceReadinessLevel = 
  | 'EARLY'
  | 'PREPARATION_REQUIRED'
  | 'FINANCE_PREPARED'
  | 'READY_FOR_PARTNER_REVIEW';

export interface FinanceReadinessBreakdown {
  technicalReadiness: { score: number; max: 15; details: string };
  financialModel: { score: number; max: 20; details: string };
  revenueVisibility: { score: number; max: 15; details: string };
  epcContractReadiness: { score: number; max: 10; details: string };
  landSiteDocumentation: { score: number; max: 10; details: string };
  permitsGrid: { score: number; max: 10; details: string };
  sponsorContribution: { score: number; max: 10; details: string };
  dataRoomCompleteness: { score: number; max: 10; details: string };
}

export interface FinanceReadinessSnapshot {
  id: string;
  financingRequestId: string;
  projectId: string;
  totalScore: number; // 0-100
  level: FinanceReadinessLevel;
  breakdown: FinanceReadinessBreakdown;
  missingRequirements: string[];
  recommendedActions: string[];
  evaluatedAt: string;
}

export type PartnerMatchEligibility = 
  | 'ELIGIBLE'
  | 'POTENTIALLY_ELIGIBLE'
  | 'NOT_ELIGIBLE'
  | 'REQUIRES_REVIEW';

export interface FinancialPartnerMatch {
  id: string;
  financingRequestId: string;
  financialPartnerProfileId: string;
  financingProductId?: string;
  matchScore: number; // 0-100
  scoreBreakdown: {
    amountFit: number; // max 20
    projectTypeFit: number; // max 15
    technologyFit: number; // max 10
    locationFit: number; // max 10
    stageFit: number; // max 10
    readinessFit: number; // max 15
    tenorFit: number; // max 10
    revenueModelFit: number; // max 5
    collateralFit: number; // max 5
  };
  eligibilityStatus: PartnerMatchEligibility;
  reasons: string[];
  algorithmVersion: string;
  status: 'PROPOSED' | 'SUBMITTED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;
}

export type FinancingSubmissionStatus = 
  | 'PREPARED'
  | 'SUBMITTED'
  | 'VIEWED'
  | 'UNDER_REVIEW'
  | 'MORE_INFO_REQUESTED'
  | 'OFFER_RECEIVED'
  | 'DECLINED'
  | 'CLOSED';

export interface FinancingSubmission {
  id: string;
  financingRequestId: string;
  financialPartnerProfileId: string;
  status: FinancingSubmissionStatus;
  submittedAt: string;
  viewedAt?: string;
  respondedAt?: string;
  authorizedDocumentIds: string[];
  message?: string;
}

export interface FinanceInformationRequest {
  id: string;
  financingSubmissionId: string;
  requestedByUserId: string;
  title: string;
  description: string;
  requiredDocumentTypes: string[];
  status: 'OPEN' | 'RESPONDED' | 'CLOSED' | 'CANCELLED';
  dueDate?: string;
  responseNote?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface FinancingFee {
  id: string;
  type: 'ARRANGEMENT_FEE' | 'PROCESSING_FEE' | 'COMMITMENT_FEE' | 'LEGAL_FEE' | 'VALUATION_FEE' | 'OTHER';
  amount: number;
  percentage?: number;
  currency: 'IRR';
  description?: string;
}

export type FinancingOfferStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CONDITIONAL'
  | 'FINAL'
  | 'SELECTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export interface FinancingOffer {
  id: string;
  offerCode: string; // e.g. FO-HSE-000001
  financingRequestId: string;
  financialPartnerProfileId: string;
  financingProductId?: string;
  status: FinancingOfferStatus;
  currency: 'IRR';
  offeredAmount: number; // in Rials
  interestRateType: 'FIXED' | 'VARIABLE' | 'PARTNER_DECLARED';
  interestRate?: number; // annual percentage e.g. 23%
  tenorMonths: number;
  gracePeriodMonths: number;
  repaymentType: 'EQUAL_INSTALLMENT' | 'EQUAL_PRINCIPAL' | 'BULLET' | 'CUSTOM';
  fees: FinancingFee[];
  collateralRequirements: string[];
  conditionsPrecedent: string[];
  securityRequirements?: string;
  validUntil?: string;
  notes?: string;
  // Deterministic computed fields
  estimatedPeriodicPayment?: number;
  estimatedTotalFinancingCost?: number;
  estimatedTotalRepayment?: number;
  comparisonScore?: number; // 0-100
  createdAt: string;
  submittedAt?: string;
}

export type ProjectFinancingRecordStatus = 
  | 'APPROVED'
  | 'DOCUMENTATION'
  | 'ACTIVE'
  | 'REPAID'
  | 'DEFAULT_REPORTED'
  | 'RESTRUCTURED'
  | 'CANCELLED';

export interface ProjectFinancingRecord {
  id: string;
  projectId: string;
  financingRequestId: string;
  financingOfferId: string;
  financialPartnerProfileId: string;
  status: ProjectFinancingRecordStatus;
  approvedAmount: number;
  currency: 'IRR';
  interestRate?: number;
  tenorMonths: number;
  gracePeriodMonths: number;
  repaymentType: 'EQUAL_INSTALLMENT' | 'EQUAL_PRINCIPAL' | 'BULLET' | 'CUSTOM';
  effectiveDate: string;
  maturityDate?: string;
  outstandingPrincipal?: number;
  agreementDocumentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceReviewNote {
  id: string;
  financingSubmissionId: string;
  authorUserId: string;
  content: string;
  visibility: 'PARTNER_INTERNAL' | 'SHARED_WITH_APPLICANT';
  createdAt: string;
}

export interface FinanceDueDiligenceItem {
  id: string;
  category: string;
  title: string;
  status: 'NOT_STARTED' | 'MISSING' | 'PARTIAL' | 'RECEIVED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  notes?: string;
  documentId?: string;
}

export interface FinanceDueDiligenceChecklist {
  id: string;
  financingSubmissionId: string;
  items: FinanceDueDiligenceItem[];
  updatedAt: string;
}
