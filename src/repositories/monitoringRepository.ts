import path from 'path';
import { db } from '../db/index.js';
import {
  TelemetrySource,
  TelemetryReading,
  AssetPerformanceSnapshot,
  AssetHealthAssessment
} from '../types/monitoring.js';

const globalSolarCache = new Map<string, any>();

export const monitoringRepository = {
  // Telemetry Sources
  getSources: (projectId?: string, assetId?: string): TelemetrySource[] => {
    return db.getTelemetrySources(projectId, assetId);
  },
  getTelemetrySources: (projectId?: string, assetId?: string): TelemetrySource[] => {
    return db.getTelemetrySources(projectId, assetId);
  },

  getSourceById: (id: string): TelemetrySource | undefined => {
    return db.getTelemetrySourceById(id);
  },

  createSource: (source: Omit<TelemetrySource, 'id' | 'createdAt' | 'updatedAt'>): TelemetrySource => {
    return db.createTelemetrySource(source);
  },
  
  createTelemetrySource: (source: Omit<TelemetrySource, 'id' | 'createdAt' | 'updatedAt'>): TelemetrySource => {
    return db.createTelemetrySource(source);
  },

  updateSource: (id: string, updates: Partial<TelemetrySource>): TelemetrySource | null => {
    return db.updateTelemetrySource(id, updates);
  },

  deleteSource: (id: string): boolean => {
    return db.deleteTelemetrySource(id);
  },

  getSourcesByAsset: (assetId: string): TelemetrySource[] => {
    return db.getTelemetrySources(undefined, assetId);
  },

  // Telemetry Readings
  getReadings: (
    assetId?: string,
    filters?: {
      from?: string;
      to?: string;
      metricType?: string;
      sourceId?: string;
      quality?: string;
    }
  ): TelemetryReading[] => {
    return db.getTelemetryReadings(assetId, filters);
  },
  getTelemetryReadings: (assetId?: string, filters?: any): TelemetryReading[] => {
    return db.getTelemetryReadings(assetId, filters);
  },
  getReadingsByAsset: (assetId: string): TelemetryReading[] => {
    return db.getTelemetryReadings(assetId);
  },

  getReadingById: (id: string): TelemetryReading | undefined => {
    return db.getTelemetryReadingById(id);
  },

  createReading: (reading: Omit<TelemetryReading, 'id' | 'createdAt'>): TelemetryReading => {
    return db.createTelemetryReading(reading);
  },
  addReading: (reading: Omit<TelemetryReading, 'id' | 'createdAt'>): TelemetryReading => {
    return db.createTelemetryReading(reading);
  },

  createReadingsBatch: (readings: Array<Omit<TelemetryReading, 'id' | 'createdAt'>>): TelemetryReading[] => {
    return db.createTelemetryReadingsBatch(readings);
  },

  // Performance Snapshots
  getPerformanceSnapshots: (assetId?: string): AssetPerformanceSnapshot[] => {
    return db.getAssetPerformanceSnapshots(assetId);
  },

  getLatestPerformanceSnapshot: (assetId?: string): AssetPerformanceSnapshot | null => {
    return db.getLatestAssetPerformanceSnapshot(assetId);
  },

  createPerformanceSnapshot: (
    snapshot: Omit<AssetPerformanceSnapshot, 'id' | 'calculatedAt'>
  ): AssetPerformanceSnapshot => {
    return db.createAssetPerformanceSnapshot(snapshot);
  },

  // Health Assessments
  getHealthAssessments: (assetId?: string): AssetHealthAssessment[] => {
    return db.getAssetHealthAssessments(assetId);
  },

  getLatestHealthAssessment: (assetId?: string): AssetHealthAssessment | null => {
    return db.getLatestAssetHealthAssessment(assetId);
  },

  createHealthAssessment: (
    assessment: Omit<AssetHealthAssessment, 'id' | 'calculatedAt'>
  ): AssetHealthAssessment => {
    return db.createAssetHealthAssessment(assessment);
  },
  
  // Alerts
  getAllAlerts: (): any[] => {
    return (db as any).getAlerts ? (db as any).getAlerts() : [];
  },

  // City Solar Irradiance Cache (PH-4 clean abstraction with runtime memory cache)
  getCityIrradianceCache: (city: string): any => {
    if (globalSolarCache.has(city)) {
      return globalSolarCache.get(city);
    }
    const diskCached = (db as any).getCityIrradianceCache ? (db as any).getCityIrradianceCache(city) : null;
    if (diskCached) {
      globalSolarCache.set(city, diskCached);
    }
    return diskCached;
  },

  setCityIrradianceCache: (cacheData: any): any => {
    if (cacheData && cacheData.city) {
      globalSolarCache.set(cacheData.city, cacheData);
    }
    try {
      const repoDbPath = path.resolve(process.cwd(), 'db.json');
      const activeDbPath = path.resolve((db as any).getDBPath ? (db as any).getDBPath() : '');
      // Never mutate baseline repo db.json with dynamic test records
      if (process.env.NODE_ENV === 'test' || activeDbPath === repoDbPath) {
        return cacheData;
      }
      return (db as any).setCityIrradianceCache ? (db as any).setCityIrradianceCache(cacheData) : cacheData;
    } catch {
      return cacheData;
    }
  }
};
