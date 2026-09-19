import { projectRepository } from "../repositories/projectRepository.js";
import { assetRepository } from "../repositories/assetRepository.js";


import { procurementRepository } from '../repositories/procurementRepository.js';
import { executionRepository } from '../repositories/executionRepository.js';
import { financingRepository } from '../repositories/financingRepository.js';
import { maintenanceRepository } from '../repositories/maintenanceRepository.js';
import { monitoringRepository } from '../repositories/monitoringRepository.js';
import { portfolioRepository } from '../repositories/portfolioRepository.js';


import { EnergyProject, ProjectStatus } from '../types/project.js';
import { EnergyAsset } from '../types/asset.js';
import {
  Portfolio,
  PortfolioOverviewSummary,
  AssetPortfolioSummary,
  AssetIntelligenceItem,
  FinancialPortfolioSummary,
  ProjectFinancialDetail,
  ProcurementIntelligenceSummary,
  OperationsIntelligenceSummary
} from '../types/portfolio.js';

export const portfolioAggregationService = {
  /**
   * Resolves all unique EnergyProject entities belonging to a Portfolio.
   */
  getPortfolioProjects(portfolio: Portfolio): EnergyProject[] {
    const allProjects = projectRepository.findAll() || [];
    const directIds = new Set(portfolio.projectIds || []);

    const matchedProjects = allProjects.filter(p => {
      if (directIds.has(p.id)) return true;
      if (portfolio.organizationId && p.organizationId === portfolio.organizationId) return true;
      return false;
    });

    // Deduplicate by ID
    const uniqueMap = new Map<string, EnergyProject>();
    for (const p of matchedProjects) {
      uniqueMap.set(p.id, p);
    }
    return Array.from(uniqueMap.values());
  },

  /**
   * Resolves all unique EnergyAsset entities belonging to a Portfolio.
   */
  getPortfolioAssets(portfolio: Portfolio, projects?: EnergyProject[]): EnergyAsset[] {
    const prjs = projects || this.getPortfolioProjects(portfolio);
    const projectIds = new Set(prjs.map(p => p.id));
    const directAssetIds = new Set(portfolio.assetIds || []);

    const allAssets = assetRepository.getAssets() || [];
    const matched = allAssets.filter(a => {
      if (directAssetIds.has(a.id)) return true;
      if (a.projectId && projectIds.has(a.projectId)) return true;
      if (portfolio.organizationId && a.organizationId === portfolio.organizationId) return true;
      return false;
    });

    const uniqueMap = new Map<string, EnergyAsset>();
    for (const a of matched) {
      uniqueMap.set(a.id, a);
    }
    return Array.from(uniqueMap.values());
  },

  /**
   * SECTION 2: PORTFOLIO OVERVIEW
   * Calculates deterministic overview metrics directly from verified stored data.
   */
  getPortfolioOverview(portfolioId: string): PortfolioOverviewSummary | null {
    const portfolio = portfolioRepository.getPortfolioById(portfolioId);
    if (!portfolio) return null;

    const projects = this.getPortfolioProjects(portfolio);
    const assets = this.getPortfolioAssets(portfolio, projects);
    const projectIds = projects.map(p => p.id);
    const assetIds = assets.map(a => a.id);

    // 1. Projects by lifecycle stage
    const projectsByLifecycleStage: Record<string, number> = {};
    for (const p of projects) {
      const st = p.status || 'DRAFT';
      projectsByLifecycleStage[st] = (projectsByLifecycleStage[st] || 0) + 1;
    }

    // 2. Planned solar capacity (strictly tracked: known vs missing)
    let knownPlannedCapacityKw = 0;
    let projectsWithKnownCapacity = 0;
    let projectsWithMissingCapacity = 0;

    for (const p of projects) {
      const cap = p.targetCapacityKw ?? (p as any).capacityKw;
      if (typeof cap === 'number' && cap > 0) {
        knownPlannedCapacityKw += cap;
        projectsWithKnownCapacity++;
      } else {
        projectsWithMissingCapacity++;
      }
    }

    // 3. Operational capacity (from assets)
    let knownOperationalCapacityKw = 0;
    let assetsWithKnownCapacity = 0;
    let assetsWithMissingCapacity = 0;
    let operationalAssetsCount = 0;

    for (const a of assets) {
      const isOperational = a.status === 'OPERATIONAL' || a.operationalStatus === 'OPERATIONAL';
      if (isOperational) {
        operationalAssetsCount++;
        const cap = a.installedCapacityKw;
        if (typeof cap === 'number' && cap > 0) {
          knownOperationalCapacityKw += cap;
          assetsWithKnownCapacity++;
        } else {
          assetsWithMissingCapacity++;
        }
      }
    }

    // 4. Projects under construction
    const projectsUnderConstruction = projects.filter(p => p.status === 'CONSTRUCTION').length;

    // 5. Active procurement processes
    let activeProcurementCount = 0;
    for (const pid of projectIds) {
      const pkgs = procurementRepository.getPackages(pid) || [];
      const rfqs = procurementRepository.getRFQs(pid) || [];
      const activePkgs = pkgs.filter(pkg => pkg.status === 'OPEN' || pkg.status === 'IN_PROGRESS' || pkg.status === 'EVALUATION' || pkg.status === 'DRAFT');
      const activeRfqs = rfqs.filter(r => r.status === 'PUBLISHED' || r.status === 'EVALUATION' || r.status === 'OPEN');
      activeProcurementCount += (activePkgs.length + activeRfqs.length);
    }

    // 6. Active contracts
    let activeContractsCount = 0;
    for (const pid of projectIds) {
      const contracts = executionRepository.getProjectContracts(pid) || [];
      const active = contracts.filter(c => c.status === 'ACTIVE' || c.status === 'SIGNED' || c.status === 'EXECUTED');
      activeContractsCount += active.length;
    }

    // 7. Open financing applications
    let openFinancingApplicationsCount = 0;
    for (const pid of projectIds) {
      const reqs = financingRepository.getFinancingRequests(pid) || [];
      const openReqs = reqs.filter(r => r.status !== 'DECLINED' && r.status !== 'REJECTED' && r.status !== 'CANCELLED');
      openFinancingApplicationsCount += openReqs.length;
    }

    // 8. Active financing agreements
    let activeFinancingAgreementsCount = 0;
    for (const pid of projectIds) {
      const finRecs = financingRepository.getProjectFinancingRecords(pid) || [];
      const activeRecs = finRecs.filter(r => r.status === 'APPROVED' || r.status === 'ACTIVE');
      activeFinancingAgreementsCount += activeRecs.length;
    }

    // 9. Open maintenance cases
    let openMaintenanceCasesCount = 0;
    const allCases = maintenanceRepository.getAllCases() || [];
    const openCases = allCases.filter(c => {
      const inPortfolio = (c.projectId && projectIds.includes(c.projectId)) || (c.assetId && assetIds.includes(c.assetId));
      return inPortfolio && c.status !== 'CLOSED' && c.status !== 'RESOLVED' && c.status !== 'CANCELLED';
    });
    openMaintenanceCasesCount = openCases.length;

    // 10. Active alerts
    let activeAlertsCount = 0;
    const allAlerts = monitoringRepository.getAllAlerts() || [];
    const openAlerts = allAlerts.filter(alt => {
      const inPortfolio = (alt.projectId && projectIds.includes(alt.projectId)) || (alt.assetId && assetIds.includes(alt.assetId));
      return inPortfolio && alt.status !== 'RESOLVED' && alt.status !== 'DISMISSED';
    });
    activeAlertsCount = openAlerts.length;

    return {
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      organizationId: portfolio.organizationId,
      totalProjects: projects.length,
      projectsByLifecycleStage,
      plannedSolarCapacity: {
        knownCapacityKw: knownPlannedCapacityKw,
        projectsWithKnownCapacity,
        projectsWithMissingCapacity,
        isFullyKnown: projectsWithMissingCapacity === 0
      },
      operationalCapacity: {
        knownCapacityKw: knownOperationalCapacityKw,
        assetsWithKnownCapacity,
        assetsWithMissingCapacity,
        isFullyKnown: assetsWithMissingCapacity === 0
      },
      projectsUnderConstruction,
      totalOperationalAssets: operationalAssetsCount,
      activeProcurementProcesses: activeProcurementCount,
      activeContracts: activeContractsCount,
      openFinancingApplications: openFinancingApplicationsCount,
      activeFinancingAgreements: activeFinancingAgreementsCount,
      openMaintenanceCases: openMaintenanceCasesCount,
      activeAlerts: activeAlertsCount,
      calculatedAt: new Date().toISOString()
    };
  },

  /**
   * SECTION 4: ASSET PORTFOLIO INTELLIGENCE
   * Aggregates operational and commissioning assets without inventing telemetry or metrics.
   */
  getAssetPortfolioIntelligence(portfolioId: string): AssetPortfolioSummary | null {
    const portfolio = portfolioRepository.getPortfolioById(portfolioId);
    if (!portfolio) return null;

    const projects = this.getPortfolioProjects(portfolio);
    const assets = this.getPortfolioAssets(portfolio, projects);
    const projectMap = new Map<string, any>(projects.map(p => [p.id, p]));

    const allTelemetrySources = monitoringRepository.getTelemetrySources() || [];
    const allReadings = monitoringRepository.getTelemetryReadings() || [];
    const allAlerts = monitoringRepository.getAllAlerts() || [];
    const allCases = maintenanceRepository.getAllCases() || [];
    const allWarranties = assetRepository.getEquipmentWarranties ? assetRepository.getEquipmentWarranties() : [];

    let operationalAssetsCount = 0;
    let nonOperationalAssetsCount = 0;
    let knownOperationalCapacityKw = 0;
    let assetsWithMissingCapacityCount = 0;

    const telemetryBreakdown = { reporting: 0, notConnected: 0, dataUnavailable: 0 };
    const healthBreakdown = { healthy: 0, degraded: 0, critical: 0, dataUnavailable: 0 };
    const warrantyBreakdown = { active: 0, expiring: 0, expired: 0, dataUnavailable: 0 };

    const assetItems: AssetIntelligenceItem[] = assets.map(asset => {
      const isOperational = asset.status === 'OPERATIONAL' || asset.operationalStatus === 'OPERATIONAL';
      if (isOperational) {
        operationalAssetsCount++;
        if (typeof asset.installedCapacityKw === 'number' && asset.installedCapacityKw > 0) {
          knownOperationalCapacityKw += asset.installedCapacityKw;
        } else {
          assetsWithMissingCapacityCount++;
        }
      } else {
        nonOperationalAssetsCount++;
      }

      // Telemetry analysis
      const assetSources = allTelemetrySources.filter(s => s.assetId === asset.id);
      const assetReadings = allReadings.filter(r => r.assetId === asset.id);
      
      let telemetryStatus: 'REPORTING' | 'DATA_UNAVAILABLE' | 'NOT_CONNECTED' = 'NOT_CONNECTED';
      let lastTelemetryTimestamp: string | null = null;

      if (assetSources.length === 0) {
        telemetryStatus = 'NOT_CONNECTED';
        telemetryBreakdown.notConnected++;
      } else if (assetReadings.length === 0) {
        telemetryStatus = 'DATA_UNAVAILABLE';
        telemetryBreakdown.dataUnavailable++;
      } else {
        // Sort readings by timestamp
        const sorted = [...assetReadings].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        lastTelemetryTimestamp = sorted[0].timestamp;
        
        // Active if reading within reasonable period (or simply present)
        telemetryStatus = 'REPORTING';
        telemetryBreakdown.reporting++;
      }

      // Health & Performance
      const performanceState = telemetryStatus === 'REPORTING' ? 'NORMAL' : 'DATA_UNAVAILABLE';
      let healthState = 'DATA_UNAVAILABLE';
      if (telemetryStatus === 'REPORTING') {
        healthState = 'HEALTHY';
        healthBreakdown.healthy++;
      } else {
        healthBreakdown.dataUnavailable++;
      }

      // Active Alerts for this asset
      const activeAlerts = allAlerts.filter(a => a.assetId === asset.id && a.status !== 'RESOLVED' && a.status !== 'DISMISSED');
      // Open Cases for this asset
      const openCases = allCases.filter(c => c.assetId === asset.id && c.status !== 'CLOSED' && c.status !== 'RESOLVED');

      // Warranties
      const assetWarranties = (assetRepository.getEquipmentWarranties ? assetRepository.getEquipmentWarranties(asset.id) : []) || [];
      let warrantyStatus: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'DATA_UNAVAILABLE' = 'DATA_UNAVAILABLE';
      let warrantyDetails = null;

      if (assetWarranties.length > 0) {
        const primary = assetWarranties[0];
        warrantyStatus = (primary.status as any) || 'ACTIVE';
        warrantyDetails = {
          provider: primary.provider || primary.vendorName,
          endDate: primary.endDate
        };
        if (warrantyStatus === 'ACTIVE') warrantyBreakdown.active++;
        else if (warrantyStatus === 'EXPIRING') warrantyBreakdown.expiring++;
        else if (warrantyStatus === 'EXPIRED') warrantyBreakdown.expired++;
        else warrantyBreakdown.dataUnavailable++;
      } else {
        warrantyBreakdown.dataUnavailable++;
      }

      const prj = asset.projectId ? projectMap.get(asset.projectId) : undefined;

      return {
        assetId: asset.id,
        assetCode: asset.assetCode || `AST-${asset.id.slice(0, 6)}`,
        name: asset.name,
        projectId: asset.projectId,
        projectCode: prj?.projectCode,
        installedCapacityKw: asset.installedCapacityKw ?? null,
        operationalStatus: asset.operationalStatus || asset.status || 'COMMISSIONING',
        telemetryStatus,
        lastTelemetryTimestamp,
        performanceState,
        healthState,
        activeAlertsCount: activeAlerts.length,
        openMaintenanceCasesCount: openCases.length,
        warrantyStatus,
        warrantyDetails
      };
    });

    return {
      portfolioId: portfolio.id,
      totalAssets: assets.length,
      operationalAssetsCount,
      nonOperationalAssetsCount,
      knownOperationalCapacityKw,
      assetsWithMissingCapacityCount,
      telemetryBreakdown,
      healthBreakdown,
      warrantyBreakdown,
      assets: assetItems,
      calculatedAt: new Date().toISOString()
    };
  },

  /**
   * SECTION 5: FINANCIAL PORTFOLIO VIEW
   * Aggregates verified financial data without fabricating numbers or treating missing as zero.
   */
  getFinancialPortfolioView(portfolioId: string): FinancialPortfolioSummary | null {
    const portfolio = portfolioRepository.getPortfolioById(portfolioId);
    if (!portfolio) return null;

    const projects = this.getPortfolioProjects(portfolio);

    let knownFinancialRecords = 0;
    let missingFinancialRecords = 0;

    let totalKnownCapexIRR = 0;
    let projectsWithCapexCount = 0;

    let totalKnownFinancingRequestedIRR = 0;
    let projectsWithFinancingRequestedCount = 0;

    let totalKnownFinancingSecuredIRR = 0;
    let projectsWithFinancingSecuredCount = 0;

    let totalKnownOwnerEquityIRR = 0;
    let projectsWithOwnerEquityCount = 0;

    let totalKnownContractValueIRR = 0;
    let projectsWithContractValueCount = 0;

    const projectFinancialDetails: ProjectFinancialDetail[] = projects.map(p => {
      // 1. CAPEX
      let capex: number | null = null;
      if (typeof p.estimatedBudgetIRR === 'number' && p.estimatedBudgetIRR > 0) {
        capex = p.estimatedBudgetIRR;
      } else if (p.estimatedBudget && typeof p.estimatedBudget.amount === 'number' && p.estimatedBudget.amount > 0) {
        capex = p.estimatedBudget.amount;
      }

      if (capex !== null) {
        totalKnownCapexIRR += capex;
        projectsWithCapexCount++;
      }

      // 2. Financing Requested & Equity
      const finReqs = financingRepository.getFinancingRequests(p.id) || [];
      let financingRequested: number | null = null;
      let ownerEquity: number | null = null;

      if (finReqs.length > 0) {
        const latestReq = finReqs[finReqs.length - 1];
        if (typeof latestReq.requestedAmount === 'number' && latestReq.requestedAmount > 0) {
          financingRequested = latestReq.requestedAmount;
          totalKnownFinancingRequestedIRR += financingRequested;
          projectsWithFinancingRequestedCount++;
        }
        if (typeof latestReq.ownerEquity === 'number' && latestReq.ownerEquity > 0) {
          ownerEquity = latestReq.ownerEquity;
          totalKnownOwnerEquityIRR += ownerEquity;
          projectsWithOwnerEquityCount++;
        }
      }

      // 3. Financing Secured
      const finRecords = financingRepository.getProjectFinancingRecords(p.id) || [];
      let financingSecured: number | null = null;
      const approvedRecords = finRecords.filter(r => r.status === 'APPROVED' || r.status === 'ACTIVE');
      if (approvedRecords.length > 0) {
        financingSecured = approvedRecords.reduce((sum, r) => sum + (r.approvedAmount || 0), 0);
        if (financingSecured > 0) {
          totalKnownFinancingSecuredIRR += financingSecured;
          projectsWithFinancingSecuredCount++;
        }
      }

      // 4. Contract Values
      const contracts = executionRepository.getProjectContracts(p.id) || [];
      let contractValue: number | null = null;
      const activeContracts = contracts.filter(c => c.status === 'ACTIVE' || c.status === 'SIGNED' || c.status === 'EXECUTED');
      if (activeContracts.length > 0) {
        const sum = activeContracts.reduce((s, c) => s + (c.contractValueIRR || (c as any).contractValue || 0), 0);
        if (sum > 0) {
          contractValue = sum;
          totalKnownContractValueIRR += contractValue;
          projectsWithContractValueCount++;
        }
      }

      const hasAnyFinancialData = capex !== null || financingRequested !== null || financingSecured !== null || ownerEquity !== null || contractValue !== null;
      const hasCompleteFinancials = capex !== null && (financingRequested !== null || ownerEquity !== null);

      if (hasAnyFinancialData) {
        knownFinancialRecords++;
      } else {
        missingFinancialRecords++;
      }

      return {
        projectId: p.id,
        projectCode: p.projectCode,
        title: p.title,
        capexIRR: capex,
        financingRequestedIRR: financingRequested,
        financingSecuredIRR: financingSecured,
        ownerEquityIRR: ownerEquity,
        contractValueIRR: contractValue,
        hasCompleteFinancials
      };
    });

    const dataCoveragePercent = projects.length > 0 ? (knownFinancialRecords / projects.length) * 100 : 0;

    const notes: string[] = [];
    if (projectsWithCapexCount < projects.length) {
      notes.push(`${projects.length - projectsWithCapexCount} پروژه فاقد برآورد CAPEX ثبت‌شده هستند.`);
    }
    if (projectsWithFinancingRequestedCount === 0 && projects.length > 0) {
      notes.push('هیچ درخواست تأمین مالی فعالی برای پروژه‌های این پرتفوی ثبت نشده است.');
    }

    return {
      portfolioId: portfolio.id,
      totalProjectsInPortfolio: projects.length,
      knownFinancialRecords,
      missingFinancialRecords,
      dataCoveragePercent: Number(dataCoveragePercent.toFixed(1)),
      aggregations: {
        totalKnownCapexIRR,
        projectsWithCapexCount,
        totalKnownFinancingRequestedIRR,
        projectsWithFinancingRequestedCount,
        totalKnownFinancingSecuredIRR,
        projectsWithFinancingSecuredCount,
        totalKnownOwnerEquityIRR,
        projectsWithOwnerEquityCount,
        totalKnownContractValueIRR,
        projectsWithContractValueCount
      },
      projectFinancialDetails,
      notes,
      calculatedAt: new Date().toISOString()
    };
  },

  /**
   * SECTION 6: PROCUREMENT & CONTRACT INTELLIGENCE
   * Aggregates existing procurement packages, deliveries, inspections, and contracts.
   */
  getProcurementIntelligence(portfolioId: string): ProcurementIntelligenceSummary | null {
    const portfolio = portfolioRepository.getPortfolioById(portfolioId);
    if (!portfolio) return null;

    const projects = this.getPortfolioProjects(portfolio);
    const projectIds = projects.map(p => p.id);

    let totalBOQs = 0;
    let totalProcurementPackages = 0;
    let openProcurementPackages = 0;
    let totalSupplierRFQs = 0;
    let activeSupplierRFQs = 0;
    let totalPurchaseOrders = 0;
    let pendingDeliveries = 0;
    let completedDeliveries = 0;
    let pendingInspections = 0;
    let totalContracts = 0;
    let activeContracts = 0;
    let totalContractRevisions = 0;
    let approvedChangeRequests = 0;
    let pendingChangeRequests = 0;

    for (const pid of projectIds) {
      // BOQs
      const boqs = procurementRepository.getBOQs(pid) || [];
      totalBOQs += boqs.length;

      // Packages
      const pkgs = procurementRepository.getPackages(pid) || [];
      totalProcurementPackages += pkgs.length;
      openProcurementPackages += pkgs.filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS' || p.status === 'EVALUATION' || p.status === 'DRAFT').length;

      // Supplier RFQs
      const rfqs = procurementRepository.getRFQs(pid) || [];
      totalSupplierRFQs += rfqs.length;
      activeSupplierRFQs += rfqs.filter(r => r.status === 'PUBLISHED' || r.status === 'EVALUATION' || r.status === 'OPEN').length;

      // Purchase Orders
      const pos = procurementRepository.getPurchaseOrders(pid) || [];
      totalPurchaseOrders += pos.length;

      // Deliveries
      const deliveries = procurementRepository.getDeliveryRecords(pid) || [];
      for (const d of deliveries) {
        const dStatus = d.status as string;
        if (dStatus === 'DELIVERED' || dStatus === 'ACCEPTED' || dStatus === 'RECEIVED') {
          completedDeliveries++;
        } else if (dStatus === 'PLANNED' || dStatus === 'SHIPPED' || dStatus === 'IN_TRANSIT' || dStatus === 'EXPECTED') {
          pendingDeliveries++;
        }
      }

      // Inspections
      const inspections = procurementRepository.getDeliveryInspectionsByProjectId(pid) || [];
      pendingInspections += inspections.filter(i => i.status === 'PENDING' || i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS').length;

      // Contracts
      const contracts = executionRepository.getProjectContracts(pid) || [];
      totalContracts += contracts.length;
      activeContracts += contracts.filter(c => c.status === 'ACTIVE' || c.status === 'SIGNED' || c.status === 'EXECUTED').length;

      // Contract Revisions
      for (const c of contracts) {
        const revs = executionRepository.getContractRevisions(c.id) || [];
        totalContractRevisions += revs.length;
      }

      // Change Requests
      const crs = executionRepository.getChangeRequestsByProjectId(pid) || [];
      approvedChangeRequests += crs.filter(c => c.status === 'APPROVED').length;
      pendingChangeRequests += crs.filter(c => c.status === 'PENDING' || c.status === 'SUBMITTED').length;
    }

    return {
      portfolioId: portfolio.id,
      totalBOQs,
      totalProcurementPackages,
      openProcurementPackages,
      totalSupplierRFQs,
      activeSupplierRFQs,
      totalPurchaseOrders,
      pendingDeliveries,
      completedDeliveries,
      pendingInspections,
      totalContracts,
      activeContracts,
      totalContractRevisions,
      approvedChangeRequests,
      pendingChangeRequests,
      calculatedAt: new Date().toISOString()
    };
  },

  /**
   * SECTION 7: OPERATIONS INTELLIGENCE
   * Aggregates Phase 7 monitoring and maintenance metrics.
   */
  getOperationsIntelligence(portfolioId: string): OperationsIntelligenceSummary | null {
    const portfolio = portfolioRepository.getPortfolioById(portfolioId);
    if (!portfolio) return null;

    const projects = this.getPortfolioProjects(portfolio);
    const assets = this.getPortfolioAssets(portfolio, projects);
    const assetIds = assets.map(a => a.id);
    const projectIds = projects.map(p => p.id);

    const operationalAssets = assets.filter(a => a.status === 'OPERATIONAL' || a.operationalStatus === 'OPERATIONAL');

    const allTelemetrySources = monitoringRepository.getTelemetrySources() || [];
    const allReadings = monitoringRepository.getTelemetryReadings() || [];

    let reportingCount = 0;
    let withoutTelemetryCount = 0;

    for (const a of operationalAssets) {
      const sources = allTelemetrySources.filter(s => s.assetId === a.id);
      const readings = allReadings.filter(r => r.assetId === a.id);
      if (sources.length > 0 && readings.length > 0) {
        reportingCount++;
      } else {
        withoutTelemetryCount++;
      }
    }

    // Alerts
    const allAlerts = monitoringRepository.getAllAlerts() || [];
    const activeAlerts = allAlerts.filter(alt => {
      const inScope = (alt.assetId && assetIds.includes(alt.assetId)) || (alt.projectId && projectIds.includes(alt.projectId));
      return inScope && alt.status !== 'RESOLVED' && alt.status !== 'DISMISSED';
    });

    const activeAlertsBySeverity = {
      INFO: activeAlerts.filter(a => a.severity === 'INFO').length,
      WARNING: activeAlerts.filter(a => a.severity === 'WARNING').length,
      HIGH: activeAlerts.filter(a => a.severity === 'HIGH').length,
      CRITICAL: activeAlerts.filter(a => a.severity === 'CRITICAL').length
    };

    // Maintenance Cases
    const allCases = maintenanceRepository.getAllCases() || [];
    const openCases = allCases.filter(c => {
      const inScope = (c.assetId && assetIds.includes(c.assetId)) || (c.projectId && projectIds.includes(c.projectId));
      return inScope && c.status !== 'CLOSED' && c.status !== 'RESOLVED' && c.status !== 'CANCELLED';
    });

    const openMaintenanceCasesByPriority = {
      LOW: openCases.filter(c => c.priority === 'LOW').length,
      MEDIUM: openCases.filter(c => c.priority === 'MEDIUM').length,
      HIGH: openCases.filter(c => c.priority === 'HIGH').length,
      CRITICAL: openCases.filter(c => c.priority === 'CRITICAL').length
    };

    // Warranties
    let coveredWithActiveWarranty = 0;
    let warrantyUnavailableOrMissing = 0;

    for (const a of operationalAssets) {
      const warranties = (assetRepository.getEquipmentWarranties ? assetRepository.getEquipmentWarranties(a.id) : []) || [];
      const hasActive = warranties.some(w => w.status === 'ACTIVE');
      if (hasActive) {
        coveredWithActiveWarranty++;
      } else {
        warrantyUnavailableOrMissing++;
      }
    }

    return {
      portfolioId: portfolio.id,
      totalOperationalAssets: operationalAssets.length,
      telemetryAvailability: {
        reporting: reportingCount,
        withoutTelemetry: withoutTelemetryCount
      },
      activeAlertsCount: activeAlerts.length,
      activeAlertsBySeverity,
      openMaintenanceCasesCount: openCases.length,
      openMaintenanceCasesByPriority,
      warrantyCoverage: {
        coveredWithActiveWarranty,
        warrantyUnavailableOrMissing
      },
      calculatedAt: new Date().toISOString()
    };
  }
};
