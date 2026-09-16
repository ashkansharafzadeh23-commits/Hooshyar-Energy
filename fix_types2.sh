sed -i '/operationalStatus?: string;/a \  gridConnectionStatus?: string;' src/types/asset.ts
sed -i '/monthlyExpectedKwh?: any;/a \  expectedDailyAverageKwh?: number;' src/types/asset.ts
sed -i 's/warrantyProvider: string;/warrantyProvider?: string;/g' src/types/asset.ts
sed -i 's/projectId: string;/projectId?: string;/g' src/services/technicianMatchingService.ts
sed -i '/timestamp: string;/a \  receivedAt?: string;' src/types/monitoring.ts
