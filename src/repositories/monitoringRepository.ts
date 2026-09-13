import { db } from '../db/index.js';
import {
  TelemetrySource,
  TelemetryReading,
  AssetPerformanceSnapshot,
  AssetHealthAssessment
} from '../types/monitoring.js';

export const monitoringRepository = {
  // Telemetry Sources
  getSources: (projectId?: string, assetId?: string): TelemetrySource[] => {
    return db.getTelemetrySources(projectId, assetId);
  },

  getSourceById: (id: string): TelemetrySource | undefined => {
    return db.getTelemetrySourceById(id);
  },

  createSource: (source: Omit<TelemetrySource, 'id' | 'createdAt' | 'updatedAt'>): TelemetrySource => {
    return db.createTelemetrySource(source);
  },

  updateSource: (id: string, updates: Partial<TelemetrySource>): TelemetrySource | null => {
    return db.updateTelemetrySource(id, updates);
  },

  deleteSource: (id: string): boolean => {
    return db.deleteTelemetrySource(id);
  },

  // Telemetry Readings
  getReadings: (
    assetId: string,
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

  getReadingById: (id: string): TelemetryReading | undefined => {
    return db.getTelemetryReadingById(id);
  },

  createReading: (reading: Omit<TelemetryReading, 'id' | 'createdAt'>): TelemetryReading => {
    return db.createTelemetryReading(reading);
  },

  createReadingsBatch: (readings: Array<Omit<TelemetryReading, 'id' | 'createdAt'>>): TelemetryReading[] => {
    return db.createTelemetryReadingsBatch(readings);
  },

  // Performance Snapshots
  getPerformanceSnapshots: (assetId: string): AssetPerformanceSnapshot[] => {
    return db.getAssetPerformanceSnapshots(assetId);
  },

  getLatestPerformanceSnapshot: (assetId: string): AssetPerformanceSnapshot | null => {
    return db.getLatestAssetPerformanceSnapshot(assetId);
  },

  createPerformanceSnapshot: (
    snapshot: Omit<AssetPerformanceSnapshot, 'id' | 'calculatedAt'>
  ): AssetPerformanceSnapshot => {
    return db.createAssetPerformanceSnapshot(snapshot);
  },

  // Health Assessments
  getHealthAssessments: (assetId: string): AssetHealthAssessment[] => {
    return db.getAssetHealthAssessments(assetId);
  },

  getLatestHealthAssessment: (assetId: string): AssetHealthAssessment | null => {
    return db.getLatestAssetHealthAssessment(assetId);
  },

  createHealthAssessment: (
    assessment: Omit<AssetHealthAssessment, 'id' | 'calculatedAt'>
  ): AssetHealthAssessment => {
    return db.createAssetHealthAssessment(assessment);
  }
};
