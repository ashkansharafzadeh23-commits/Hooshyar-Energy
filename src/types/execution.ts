export interface ProjectContract {
  id: string;
  contractCode: string;
  projectId: string;
  contractType: string; 
  status: string; 
  title: string;
  clientPartyId?: string; 
  contractorPartyId?: string;
  selectedBidId?: string;
  currency: string;
  contractValue: number;
  startDate?: string;
  plannedCompletionDate?: string;
  effectiveDate?: string;
  warrantyPeriodMonths?: number;
  scopeSummary?: string;
  paymentTermsSummary?: string;
  retentionPercent?: number;
  liquidatedDamagesSummary?: string;
  terminationSummary?: string;
  documentId?: string; 
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractParty {
  id: string;
  contractId: string;
  partyType: 'INDIVIDUAL' | 'ORGANIZATION';
  userId?: string;
  organizationId?: string;
  role: 'CLIENT' | 'EPC' | 'SUPPLIER' | 'INVESTOR' | 'CONSULTANT' | 'OTHER';
  displayName: string;
  verificationStatus: string;
}

export interface ContractRevision {
  id: string;
  contractId: string;
  revisionNumber: number;
  snapshot: any; 
  documentId?: string;
  changeSummary: string;
  createdByUserId: string;
  createdAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  contractId?: string;
  milestoneCode: string;
  title: string;
  description?: string;
  category: string; 
  status: string; 
  sequence: number;
  responsibleUserId?: string;
  responsibleOrganizationId?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  weightPercent: number; 
  completionPercent: number; 
  requiresApproval: boolean;
  evidenceRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneDependency {
  id: string;
  projectId: string;
  predecessorMilestoneId: string;
  successorMilestoneId: string;
  dependencyType: 'FINISH_TO_START' | 'START_TO_START' | 'FINISH_TO_FINISH';
}

export interface ApprovalRequest {
  id: string;
  projectId: string;
  entityType: string; 
  entityId: string;
  requestedByUserId: string;
  approverUserId?: string;
  approverOrganizationId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  comment?: string;
  requestedAt: string;
  respondedAt?: string;
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  contractId: string;
  title: string;
  description: string;
  requestedBy: string;
  costImpact: number;
  scheduleImpactDays: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface ProjectBaseline {
  id: string;
  projectId: string;
  contractId: string;
  contractValue: number;
  plannedCompletionDate?: string;
  milestonePlan: any;
  createdAt: string;
}

export type ProjectHealthStatus = 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'BLOCKED' | 'COMPLETED';
