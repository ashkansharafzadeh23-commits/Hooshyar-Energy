export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'UNDER_INVESTIGATION'
  | 'MAINTENANCE_REQUIRED'
  | 'RESOLVED'
  | 'DISMISSED';

export type AlertType = 
  | 'PERFORMANCE_DEVIATION'
  | 'LOW_AVAILABILITY'
  | 'TELEMETRY_LOSS'
  | 'TELEMETRY_QUALITY'
  | 'INVERTER_FAULT'
  | 'COMPONENT_FAULT'
  | 'BATTERY_SOC_ANOMALY'
  | 'GRID_ANOMALY'
  | 'TEMPERATURE_ANOMALY'
  | 'GENERATION_ANOMALY'
  | 'MANUAL'
  | 'OTHER';

export interface AssetAlert {
  id: string;
  alertCode: string; // ALT-HSE-000001
  projectId: string;
  assetId: string;
  componentId?: string;
  sourceId?: string;
  alertType: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  detectedAt: string;
  firstObservedAt?: string;
  lastObservedAt?: string;
  metricType?: string;
  observedValue?: number;
  expectedValue?: number;
  deviationPercent?: number;
  thresholdRuleId?: string;
  performanceSnapshotId?: string;
  healthAssessmentId?: string;
  investigationNotes?: string[];
  maintenanceCaseId?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertRuleType = 
  | 'VALUE_ABOVE'
  | 'VALUE_BELOW'
  | 'DEVIATION_ABOVE'
  | 'DEVIATION_BELOW'
  | 'TELEMETRY_MISSING'
  | 'HEALTH_SCORE_BELOW';

export interface AlertRule {
  id: string;
  projectId?: string;
  assetId?: string;
  name: string;
  metricType?: string;
  ruleType: AlertRuleType;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  thresholdValue?: number;
  thresholdPercent?: number;
  durationMinutes?: number;
  severity: AlertSeverity;
  enabled: boolean;
  sourceType?: string;
  createdAt: string;
  updatedAt: string;
}

export type DiagnosisStatus = 
  | 'INSUFFICIENT_DATA'
  | 'POSSIBLE_CAUSE_IDENTIFIED'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'ACTION_RECOMMENDED';

export interface MaintenanceDiagnosis {
  id: string;
  projectId: string;
  assetId: string;
  alertId?: string;
  componentId?: string;
  diagnosisStatus: DiagnosisStatus;
  facts: string[];
  inferences: string[];
  possibleCauses: string[];
  evidence: string[];
  recommendedActions: string[];
  requiredExpertise: string[];
  warrantyStatus?: 'ACTIVE' | 'EXPIRED' | 'INSUFFICIENT_DATA';
  warrantyDetails?: string;
  confidence?: number;
  generatedBy: string; // 'DETERMINISTIC_ENGINE' | 'AI_ASSISTED' | user ID
  createdAt: string;
}

export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type MaintenanceStatus = 
  | 'OPEN'
  | 'DIAGNOSING'
  | 'AWAITING_ASSIGNMENT'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'AWAITING_VERIFICATION'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';

export interface MaintenanceCase {
  id: string;
  maintenanceCode: string; // MNT-HSE-000001
  projectId: string;
  assetId: string;
  componentId?: string;
  alertIds: string[];
  title: string;
  description: string;
  category: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reportedBy: string;
  reportedAt: string;
  diagnosisId?: string;
  assignedTechnicianId?: string;
  assignedOrganizationId?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  verificationPassed?: boolean;
  resolutionSummary?: string;
  rootCause?: string;
  actionsTaken?: string;
  downtimeMinutes?: number | null;
  laborCost?: number | null;
  partsCost?: number | null;
  totalCost?: number | null;
  currency?: string;
  postMaintenanceCheck?: {
    status: 'IMPROVED' | 'UNCHANGED' | 'DEGRADED' | 'INSUFFICIENT_DATA';
    preGenerationKwh?: number | null;
    postGenerationKwh?: number | null;
    evaluatedAt: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceAssignmentHistory {
  id: string;
  maintenanceCaseId: string;
  technicianId: string;
  organizationId?: string;
  assignedBy: string;
  assignedAt: string;
  status: 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  notes?: string;
}

export type MaintenanceActionType = 
  | 'INSPECTION'
  | 'CLEANING'
  | 'REPAIR'
  | 'RESET'
  | 'CONFIGURATION'
  | 'PART_REPLACEMENT'
  | 'TEST'
  | 'OTHER';

export interface MaintenanceAction {
  id: string;
  maintenanceCaseId: string;
  actionType: MaintenanceActionType;
  description: string;
  componentId?: string;
  replacedComponentId?: string;
  newComponentSerial?: string;
  newComponentModel?: string;
  performedBy: string;
  performedAt: string;
  notes?: string;
  createdAt: string;
}

export interface TechnicianMatchResult {
  technician: {
    id: string;
    fullName: string;
    phone: string;
    specialties: string[];
    serviceCities: string[];
    yearsExperience: number;
    bio: string;
    profileImageUrl?: string;
    certifications: { title: string; imageUrl: string }[];
    status: string;
    rating?: number | null;
  };
  score: number;
  matchReasons: string[];
  locationMatch: boolean;
  specialtyMatch: boolean;
  experienceMatch: boolean;
}

export interface AssetMaintenanceHistoryItem {
  id: string;
  eventType: 'ALERT' | 'MAINTENANCE_CASE' | 'ACTION' | 'VERIFICATION';
  timestamp: string;
  title: string;
  description: string;
  status: string;
  severity?: string;
  code?: string;
  technicianName?: string;
  componentName?: string;
  cost?: number | null;
}
