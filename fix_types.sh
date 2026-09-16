# 1. EnergyAsset
sed -i '/status: EnergyAssetStatus;/a \  operationalStatus?: string;' src/types/asset.ts

# 2. TelemetrySource
sed -i 's/provider: string;/provider?: string;/g' src/types/monitoring.ts

# 3. AssetPerformanceBaseline
sed -i 's/monthlyExpectedKwh?: number;/monthlyExpectedKwh?: any;/g' src/types/asset.ts

# 4. EquipmentWarranty
sed -i '/warrantyProvider: string;/a \  provider?: string;' src/types/asset.ts

# 5. TechnicianMatchingService
sed -i '/componentType?: string;/a \    skillsRequired?: string[];\n    location?: string;\n    province?: string;\n    equipmentType?: string;' src/services/technicianMatchingService.ts

# 6. TechnicianMatch
sed -i '/status: string;/a \  profile?: any;\n  technician?: any;' src/types/maintenance.ts

# 7 & 8 & 9. TelemetryMetricType & TelemetryReadingQuality & TelemetryReading
sed -i '/| '"'"'VOLTAGE'"'"'/a \  | '"'"'GRID_FREQ'"'"'' src/types/monitoring.ts
sed -i '/| '"'"'CRITICAL'"'"'/a \  | '"'"'GOOD'"'"'' src/types/monitoring.ts
sed -i '/assetId: string;/a \  projectId?: string;' src/types/monitoring.ts
