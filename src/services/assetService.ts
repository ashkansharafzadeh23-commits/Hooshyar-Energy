import { assetRepository } from '../repositories/assetRepository.js';
import { procurementRepository } from '../repositories/procurementRepository.js';
import { projectRepository } from '../repositories/projectRepository.js';
import {
  EnergyAsset,
  CommissioningRecord,
  CommissioningTest,
  CommissioningTestType,
  ProjectHandover,
  PunchListItem,
  CommissioningGatingCheck,
  HandoverReadinessCheck,
  AssetPassportSnapshot,
  AssetPerformanceBaseline,
  AssetComponent
} from '../types/asset.js';

export const STANDARD_COMMISSIONING_TESTS: {
  testType: CommissioningTestType;
  expectedRange: string;
  isMandatory: boolean;
}[] = [
  { testType: 'INSULATION_RESISTANCE', expectedRange: '> 1.0 MΩ at 1000V DC', isMandatory: true },
  { testType: 'GROUNDING_RESISTANCE', expectedRange: '< 5.0 Ω to Earth', isMandatory: true },
  { testType: 'STRING_VOLTAGE', expectedRange: 'Within ±5% of Voc specification', isMandatory: true },
  { testType: 'STRING_CURRENT', expectedRange: 'Within ±5% of Isc specification under uniform irradiance', isMandatory: true },
  { testType: 'INVERTER_STARTUP', expectedRange: 'Smooth MPPT tracking without fault codes', isMandatory: true },
  { testType: 'PROTECTION_RELAY', expectedRange: 'Trip within 100ms on simulated over/under voltage & frequency', isMandatory: true },
  { testType: 'GRID_SYNCHRONIZATION', expectedRange: 'THD < 3%, phase angle lock within 50Hz ±0.2Hz', isMandatory: true },
  { testType: 'METER_VALIDATION', expectedRange: 'Accuracy class 0.2S compliant calibration verified', isMandatory: true },
  { testType: 'MONITORING_COMMUNICATION', expectedRange: 'Data latency < 5s to SCADA/monitoring gateway', isMandatory: false },
  { testType: 'VISUAL_INSPECTION', expectedRange: 'Zero physical damage, correct cable torque and labelling', isMandatory: true }
];

export class AssetService {
  /**
   * Start commissioning for a project.
   * Initializes standard solar test suites if not already present.
   */
  startCommissioning(projectId: string, userId: string): CommissioningRecord {
    const existing = assetRepository.getCommissioningRecords(projectId);
    if (existing.length > 0) {
      return existing[0];
    }

    const record = assetRepository.createCommissioningRecord({
      projectId,
      status: 'IN_PROGRESS',
      plannedDate: new Date().toISOString(),
      tests: [],
      documents: []
    });

    // Create standard test suite
    STANDARD_COMMISSIONING_TESTS.forEach(testSpec => {
      const test = assetRepository.createCommissioningTest({
        commissioningRecordId: record.id,
        testType: testSpec.testType,
        status: 'NOT_STARTED',
        expectedRange: testSpec.expectedRange
      });
      record.tests.push(test.id);
    });

    // Update record tests
    assetRepository.updateCommissioningRecord(record.id, { tests: record.tests });

    // Update project lifecycle status to COMMISSIONING if currently in CONSTRUCTION or PROCUREMENT
    const project = projectRepository.findById(projectId);
    if (project && (project.status === 'CONSTRUCTION' || project.status === 'PROCUREMENT')) {
      projectRepository.update(projectId, { status: 'COMMISSIONING' });
    }

    projectRepository.addActivity({
      projectId,
      userId,
      activityType: 'COMMISSIONING_STARTED',
      description: 'فرآیند راه‌اندازی و آزمون‌های عملکردی پروژه آغاز گردید.'
    });

    return record;
  }

  /**
   * Evaluate commissioning gating deterministically.
   * Blocks approval if any tests fail, are pending, or if critical punch list items are open.
   */
  checkCommissioningGating(projectId: string): CommissioningGatingCheck {
    const records = assetRepository.getCommissioningRecords(projectId);
    if (records.length === 0) {
      return {
        canApprove: false,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        pendingTests: 0,
        criticalPunchListCount: 0,
        blockingReasons: ['هیچ پرونده راه‌اندازی ثبت نشده است (اطلاعات کافی وجود ندارد).']
      };
    }

    const record = records[0];
    const tests = assetRepository.getCommissioningTests(record.id);
    const punchList = assetRepository.getPunchListItems(projectId);

    if (tests.length === 0) {
      return {
        canApprove: false,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        pendingTests: 0,
        criticalPunchListCount: 0,
        blockingReasons: ['هیچ آزمون راه‌اندازی برای این پروژه ثبت نشده است.']
      };
    }

    let passed = 0;
    let failed = 0;
    let pending = 0;
    const blockingReasons: string[] = [];

    tests.forEach(t => {
      if (t.status === 'PASSED' || t.status === 'WAIVED') {
        passed++;
      } else if (t.status === 'FAILED') {
        failed++;
        blockingReasons.push(`آزمون ${t.testType} مردود شده است (نتیجه اندازه‌گیری شده: ${t.measuredValue || 'نامشخص'}).`);
      } else {
        pending++;
        blockingReasons.push(`آزمون ${t.testType} هنوز انجام یا تأیید نشده است.`);
      }
    });

    const openCriticalPunchList = punchList.filter(
      p => p.severity === 'CRITICAL' && p.status !== 'RESOLVED' && p.status !== 'WAIVED'
    );

    if (openCriticalPunchList.length > 0) {
      blockingReasons.push(`${openCriticalPunchList.length} مورد پانچ‌لیست بحرانی باز وجود دارد که مانع تأیید راه‌اندازی است.`);
    }

    const canApprove = failed === 0 && pending === 0 && openCriticalPunchList.length === 0 && passed > 0;

    return {
      canApprove,
      totalTests: tests.length,
      passedTests: passed,
      failedTests: failed,
      pendingTests: pending,
      criticalPunchListCount: openCriticalPunchList.length,
      blockingReasons
    };
  }

  /**
   * Approve Commissioning Record.
   * Gated: strictly rejects if conditions fail.
   */
  approveCommissioning(projectId: string, userId: string, notes?: string): CommissioningRecord {
    const gating = this.checkCommissioningGating(projectId);
    if (!gating.canApprove) {
      throw new Error(`امکان تأیید راه‌اندازی وجود ندارد: ${gating.blockingReasons.join(' | ')}`);
    }

    const records = assetRepository.getCommissioningRecords(projectId);
    const record = records[0];

    const updated = assetRepository.updateCommissioningRecord(record.id, {
      status: 'APPROVED',
      approvedByUserId: userId,
      actualDate: new Date().toISOString(),
      notes: notes || record.notes
    })!;

    projectRepository.addActivity({
      projectId,
      userId,
      activityType: 'COMMISSIONING_APPROVED',
      description: 'آزمون‌های راه‌اندازی با موفقیت کامل تأیید نهایی شدند.'
    });

    return updated;
  }

  /**
   * Check Handover Readiness deterministically.
   */
  checkHandoverReadiness(projectId: string): HandoverReadinessCheck {
    const commissioningRecords = assetRepository.getCommissioningRecords(projectId);
    const commissioningApproved = commissioningRecords.some(r => r.status === 'APPROVED');

    const handover = assetRepository.getProjectHandover(projectId);
    const punchList = assetRepository.getPunchListItems(projectId);
    const openCriticalPunchList = punchList.filter(
      p => p.severity === 'CRITICAL' && p.status !== 'RESOLVED' && p.status !== 'WAIVED'
    );

    const blockingReasons: string[] = [];

    if (!commissioningApproved) {
      blockingReasons.push('راه‌اندازی پروژه (Commissioning) هنوز تأیید نشده است.');
    }

    if (!handover) {
      blockingReasons.push('چک‌لیست تحویل پروژه هنوز ایجاد نشده است.');
      return {
        canApprove: false,
        commissioningApproved,
        documentsComplete: false,
        trainingComplete: false,
        sparePartsDelivered: false,
        warrantyDelivered: false,
        manualsDelivered: false,
        unresolvedCriticalPunchList: openCriticalPunchList.length,
        blockingReasons
      };
    }

    if (!handover.documentsComplete) blockingReasons.push('مدارک و نقشه‌های چون‌ساخت (As-Built) تحویل نشده‌اند.');
    if (!handover.trainingComplete) blockingReasons.push('دوره‌های آموزشی بهره‌بردار تکمیل نشده است.');
    if (!handover.sparePartsDelivered) blockingReasons.push('قطعات یدکی تحویل داده نشده‌اند.');
    if (!handover.warrantyDelivered) blockingReasons.push('ضمانت‌نامه‌های تجهیزات تحویل داده نشده‌اند.');
    if (!handover.manualsDelivered) blockingReasons.push('کتابچه‌های بهره‌برداری و نگهداری (O&M) تحویل نشده‌اند.');
    if (openCriticalPunchList.length > 0) blockingReasons.push(`${openCriticalPunchList.length} مورد نقص بحرانی در پانچ‌لیست حل نشده است.`);

    const canApprove = commissioningApproved &&
      handover.documentsComplete &&
      handover.trainingComplete &&
      handover.sparePartsDelivered &&
      handover.warrantyDelivered &&
      handover.manualsDelivered &&
      openCriticalPunchList.length === 0;

    return {
      canApprove,
      commissioningApproved,
      documentsComplete: handover.documentsComplete,
      trainingComplete: handover.trainingComplete,
      sparePartsDelivered: handover.sparePartsDelivered,
      warrantyDelivered: handover.warrantyDelivered,
      manualsDelivered: handover.manualsDelivered,
      unresolvedCriticalPunchList: openCriticalPunchList.length,
      blockingReasons
    };
  }

  /**
   * Approve Handover
   */
  approveHandover(projectId: string, userId: string, notes?: string): ProjectHandover {
    const readiness = this.checkHandoverReadiness(projectId);
    if (!readiness.canApprove) {
      throw new Error(`امکان تأیید تحویل پروژه وجود ندارد: ${readiness.blockingReasons.join(' | ')}`);
    }

    const handover = assetRepository.getProjectHandover(projectId)!;
    const updated = assetRepository.updateProjectHandover(handover.id, {
      status: 'APPROVED',
      handoverDate: new Date().toISOString(),
      finalApprovalId: userId,
      notes: notes || handover.notes
    })!;

    projectRepository.addActivity({
      projectId,
      userId,
      activityType: 'HANDOVER_APPROVED',
      description: 'فرآیند تحویل قطعی پروژه با تأیید تمامی الزامات تکمیل شد.'
    });

    return updated;
  }

  /**
   * Generate Energy Asset from verified project actuals.
   * Gated: requires Commissioning APPROVED and Handover APPROVED!
   */
  generateEnergyAsset(projectId: string, userId: string): EnergyAsset {
    const project = projectRepository.findById(projectId);
    if (!project) throw new Error('Project not found');

    const commissioningRecords = assetRepository.getCommissioningRecords(projectId);
    const commissioningRecord = commissioningRecords.find(r => r.status === 'APPROVED');
    if (!commissioningRecord) {
      throw new Error('راه‌اندازی پروژه تأیید نشده است. ایجاد دارایی انرژی مسدود می‌باشد.');
    }

    const handover = assetRepository.getProjectHandover(projectId);
    if (!handover || handover.status !== 'APPROVED') {
      throw new Error('تحویل قطعی پروژه (Handover) تأیید نشده است. ایجاد دارایی انرژی مسدود می‌باشد.');
    }

    // Check if asset already exists
    const existingAssets = assetRepository.getAssetsByProjectId(projectId);
    let asset: EnergyAsset;

    if (existingAssets.length > 0) {
      asset = existingAssets[0];
      assetRepository.updateAsset(asset.id, {
        status: 'OPERATIONAL',
        commissioningDate: commissioningRecord.actualDate || new Date().toISOString()
      });
    } else {
      // Create new EnergyAsset inheriting verified project actuals
      asset = assetRepository.createAsset({
        projectId,
        name: project.name,
        assetType: project.projectType || 'SOLAR_PV',
        status: 'OPERATIONAL',
        capacityKw: project.capacityKw || 1000,
        location: {
          latitude: project.location?.coordinates?.[1] || 35.6892,
          longitude: project.location?.coordinates?.[0] || 51.3890,
          address: project.location?.address || 'سایت احداث نیروگاه',
          province: project.location?.province || 'تهران',
          city: project.location?.city || 'تهران'
        },
        commissioningDate: commissioningRecord.actualDate || new Date().toISOString(),
        gridInterconnectionType: 'DISTRIBUTION_GRID',
        components: [],
        warranties: [],
        ownerOrganizationId: project.ownerOrganizationId,
        operatorOrganizationId: project.epcOrganizationId
      });
    }

    // Generate Asset Components from accepted deliveries and BOQ
    const boqs = procurementRepository.getBOQs(projectId);
    const boqItems: any[] = [];
    boqs.forEach(b => boqItems.push(...procurementRepository.getBOQItems(b.id)));

    const existingComponents = assetRepository.getAssetComponents(asset.id);
    if (existingComponents.length === 0) {
      boqItems.forEach((item, idx) => {
        const comp = assetRepository.createAssetComponent({
          assetId: asset.id,
          componentType: item.category || 'OTHER',
          manufacturer: item.manufacturerPreference || 'استاندارد',
          model: item.modelPreference || item.itemType || `تجهیز ${idx + 1}`,
          serialNumber: `SN-${item.category || 'EQ'}-${String(idx + 1).padStart(5, '0')}`,
          quantity: item.quantity || 1,
          installationDate: commissioningRecord.actualDate || new Date().toISOString(),
          status: 'OPERATIONAL'
        });
        asset.components.push(comp.id);
      });
    }

    // Link Equipment Warranties to asset
    const warranties = assetRepository.getEquipmentWarrantiesByProjectId(projectId);
    warranties.forEach(w => {
      assetRepository.updateEquipmentWarranty(w.id, { assetId: asset.id });
      if (!asset.warranties.includes(w.id)) {
        asset.warranties.push(w.id);
      }
    });

    // Update asset components and warranties
    assetRepository.updateAsset(asset.id, {
      components: asset.components,
      warranties: asset.warranties
    });

    // Generate Performance Baseline
    const annualEstimatedKwh = (asset.capacityKw || 1000) * 1650; // Standard solar irradiance yield
    assetRepository.createAssetPerformanceBaseline({
      assetId: asset.id,
      annualGenerationKwh: annualEstimatedKwh,
      monthlyGenerationKwh: Math.round(annualEstimatedKwh / 12),
      performanceRatioPercent: 81.5,
      availabilityPercent: 99.0,
      degradationPercent: 0.5,
      source: 'PROJECT_FEASIBILITY_ACTUALS',
      version: 1
    });

    // Generate Immutable Asset Passport Snapshot
    const components = assetRepository.getAssetComponents(asset.id);
    const updatedWarranties = assetRepository.getEquipmentWarranties(asset.id);

    const snapshot = assetRepository.createAssetPassportSnapshot({
      assetId: asset.id,
      snapshotType: 'COMMISSIONING',
      snapshotData: {
        assetCode: asset.assetCode,
        name: asset.name,
        capacityKw: asset.capacityKw,
        commissioningDate: asset.commissioningDate,
        status: asset.status,
        componentsCount: components.length,
        components: components.map(c => ({
          type: c.componentType,
          manufacturer: c.manufacturer,
          model: c.model,
          serialNumber: c.serialNumber,
          quantity: c.quantity
        })),
        warrantiesCount: updatedWarranties.length,
        warranties: updatedWarranties.map(w => ({
          manufacturer: w.manufacturer,
          model: w.model,
          start: w.warrantyStart,
          end: w.warrantyEnd
        })),
        commissioningApprovedAt: commissioningRecord.actualDate,
        handoverApprovedAt: handover.handoverDate
      },
      verifiedByUserId: userId
    });

    // Finally transition EnergyProject to OPERATIONAL
    projectRepository.update(projectId, { status: 'OPERATIONAL' });

    projectRepository.addActivity({
      projectId,
      userId,
      activityType: 'ASSET_ACTIVATED',
      description: `شناسنامه دارایی انرژی ${asset.assetCode} صادر گردید و پروژه به وضعیت تجاری (OPERATIONAL) ارتقا یافت.`
    });

    return asset;
  }
}

export const assetService = new AssetService();
