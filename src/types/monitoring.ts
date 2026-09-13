export type TelemetrySourceType = 
  | 'INVERTER'
  | 'SMART_METER'
  | 'BATTERY_BMS'
  | 'WEATHER_STATION'
  | 'MANUAL_UPLOAD'
  | 'API'
  | 'OTHER';

export type TelemetrySourceStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';

export interface TelemetrySource {
  id: string;
  assetId: string;
  projectId: string;
  sourceType: TelemetrySourceType;
  provider: string;
  externalSourceId?: string;
  name: string;
  status: TelemetrySourceStatus;
  lastSyncAt?: string;
  samplingIntervalSeconds?: number;
  configuration?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type TelemetryMetricType = 
  | 'POWER_KW'
  | 'ENERGY_KWH'
  | 'VOLTAGE'
  | 'CURRENT'
  | 'FREQUENCY'
  | 'IRRADIANCE'
  | 'AMBIENT_TEMPERATURE'
  | 'MODULE_TEMPERATURE'
  | 'BATTERY_SOC'
  | 'BATTERY_POWER_KW'
  | 'GRID_IMPORT_KW'
  | 'GRID_EXPORT_KW'
  | 'OTHER';

export type TelemetryReadingQuality = 'VALID' | 'ESTIMATED' | 'INVALID' | 'MISSING';

export interface TelemetryReading {
  id: string;
  assetId: string;
  sourceId: string;
  timestamp: string; // ISO 8601
  metricType: TelemetryMetricType;
  value: number;
  unit: string;
  quality: TelemetryReadingQuality;
  metadata?: Record<string, any>;
  createdAt: string;
}

export type PerformanceSnapshotStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'INSUFFICIENT_DATA';

export interface AssetPerformanceSnapshot {
  id: string;
  assetId: string;
  projectId: string;
  periodStart: string;
  periodEnd: string;
  actualGenerationKwh: number;
  expectedGenerationKwh: number | null;
  performanceRatioPercent: number | null;
  availabilityPercent: number | null;
  capacityFactorPercent: number | null;
  dataCompletenessPercent: number | null;
  healthScore: number | null;
  status: PerformanceSnapshotStatus;
  calculatedAt: string;
  calculationVersion: number;
  deviationPercent?: number | null;
  notes?: string;
}

export type AssetHealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'INSUFFICIENT_DATA';

export interface AssetHealthAssessment {
  id: string;
  assetId: string;
  projectId: string;
  status: AssetHealthStatus;
  score: number | null;
  riskFactors: string[];
  detectedIssues: string[];
  assessmentPeriodStart: string;
  assessmentPeriodEnd: string;
  factorBreakdown?: {
    performanceDeviationScore?: number | null;
    availabilityScore?: number | null;
    telemetryQualityScore?: number | null;
    componentStatusScore?: number | null;
    weights: {
      performanceDeviation: number;
      availability: number;
      telemetryQuality: number;
      componentStatus: number;
    };
  };
  calculatedAt: string;
}

export interface TelemetryValidationResult {
  isValid: boolean;
  quality: TelemetryReadingQuality;
  error?: string;
}

export interface BulkIngestResult {
  acceptedCount: number;
  rejectedCount: number;
  errors: Array<{
    index?: number;
    sourceId?: string;
    metricType?: string;
    timestamp?: string;
    error: string;
    data?: any;
  }>;
  readings: TelemetryReading[];
}

export interface PerformanceDeviation {
  actualGenerationKwh: number;
  expectedGenerationKwh: number;
  deviationPercent: number;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
}
