/**
 * @file scripts/test_ui10_final_product_qa.ts
 * @description HOOSHYAR ENERGY — UI-10 FINAL PRODUCT QA & PRODUCTION EXPERIENCE GATE TEST
 * 
 * Verifies repository-wide data-truth invariants, Project vs Asset semantic boundaries,
 * mobile responsiveness guarantees, role isolation, and database immutability.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT_DIR = process.cwd();
const DB_PATH = path.join(ROOT_DIR, 'db.json');
const MIGRATION_REPORT_PATH = path.join(ROOT_DIR, 'docs/POSTGRES_MIGRATION_REPORT.md');

const BASELINE_DB_HASH = 'de1c80c200b77dbbcdbb6fd077bced308b76969c9026ceb2715d21e2c92409c2';
const BASELINE_REPORT_HASH = '50814eac6cd752d801f35f23d98d2c45db61cfc1cc91dc080792a69f79867afb';

function sha256(content: Buffer | string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ ${message}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAILED: ${message}`);
  }
}

console.log('========================================================================');
console.log('HOOSHYAR ENERGY — UI-10 FINAL PRODUCT QA & PRODUCTION EXPERIENCE GATE');
console.log('========================================================================');

// [1] DATABASE & REPORT IMMUTABILITY CHECK
console.log('\n[1] Baseline Immutability Guard:');
const currentDbHash = sha256(fs.readFileSync(DB_PATH));
assert(currentDbHash === BASELINE_DB_HASH, `db.json is byte-for-byte identical (${currentDbHash})`);

const currentReportHash = sha256(fs.readFileSync(MIGRATION_REPORT_PATH));
assert(currentReportHash === BASELINE_REPORT_HASH, `POSTGRES_MIGRATION_REPORT.md is unmodified (${currentReportHash})`);

// [2] DATA-TRUTH & ANTI-FABRICATION INVARIANTS IN UI COMPONENTS
console.log('\n[2] Data-Truth Global Audit & Anti-Fabrication Invariants:');

// PanelPlacementTool
const panelToolCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/solar/PanelPlacementTool.tsx'), 'utf8');
assert(!panelToolCode.includes('Math.random()'), 'PanelPlacementTool contains NO Math.random() calls');
assert(panelToolCode.includes('efficiency: 1.0'), 'PanelPlacementTool specifies 1.0 nominal standard efficiency');

// AILayoutOptimizer
const aiLayoutCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/solar/AILayoutOptimizer.tsx'), 'utf8');
assert(!aiLayoutCode.includes('Math.random()'), 'AILayoutOptimizer contains NO Math.random() calls');

// Result.tsx
const resultCode = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/Result.tsx'), 'utf8');
assert(!resultCode.includes('* 1.15'), 'Result.tsx does NOT use arbitrary * 1.15 multiplier for monthly generation');
assert(resultCode.includes('annualGenerationKwh ? Math.round(result.solar.annualGenerationKwh / 12) : 0'), 'Result.tsx derives monthly generation directly from annual solar engineering calculation');

// SmartMaintenance.tsx
const smartMaintCode = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/SmartMaintenance.tsx'), 'utf8');
assert(!smartMaintCode.includes('|| 0.85'), 'SmartMaintenance.tsx does NOT fabricate 85% default confidence score');
assert(smartMaintCode.includes('diagnosis.confidenceScore !== undefined'), 'SmartMaintenance.tsx checks defined confidence score before displaying');

// ProjectToAssetTransition.tsx
const transitionCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/execution/ProjectToAssetTransition.tsx'), 'utf8');
assert(!transitionCode.includes('{projectCapacityKw || 0} kW'), 'ProjectToAssetTransition does NOT fabricate 0 kW for missing capacity');
assert(transitionCode.includes('projectCapacityKw !== undefined && projectCapacityKw !== null'), 'ProjectToAssetTransition preserves nullish capacity state');

// Financing Selection Review & Comparison
const finReviewCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/financing/FinancingSelectionReview.tsx'), 'utf8');
assert(!finReviewCode.includes('{offer.gracePeriodMonths || 0} ماه'), 'FinancingSelectionReview does NOT use unsafe truthy check for grace period');
assert(finReviewCode.includes('offer.gracePeriodMonths !== undefined && offer.gracePeriodMonths !== null'), 'FinancingSelectionReview uses nullish check for gracePeriodMonths');

const finCompCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/financing/FinancingOfferComparison.tsx'), 'utf8');
assert(!finCompCode.includes('{offer.gracePeriodMonths || 0} ماه'), 'FinancingOfferComparison mobile cards do NOT use unsafe truthy check for grace period');

// AssetTab & HandoverTab
const assetTabCode = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/projects/Workspace/AssetTab.tsx'), 'utf8');
assert(assetTabCode.includes('useState<number | undefined>(undefined)'), 'AssetTab initializes targetCapacityKw as undefined, not 0');
assert(assetTabCode.includes('targetCapacityKw ?? pData.capacityKw ?? undefined'), 'AssetTab uses nullish assignment for project capacity');

const handoverTabCode = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/projects/Workspace/HandoverTab.tsx'), 'utf8');
assert(handoverTabCode.includes('useState<number | undefined>(undefined)'), 'HandoverTab initializes targetCapacityKw as undefined, not 0');
assert(handoverTabCode.includes('targetCapacityKw ?? pData.capacityKw ?? undefined'), 'HandoverTab uses nullish assignment for project capacity');

// [3] ENERGYPROJECT VS ENERGYASSET SEMANTIC INTEGRITY
console.log('\n[3] EnergyProject vs EnergyAsset Semantic Separation:');

const projectAssetBridgeCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/integration/ProjectAssetBridge.tsx'), 'utf8');
assert(
  projectAssetBridgeCode.includes('COMMISSIONED') && projectAssetBridgeCode.includes('OPERATIONAL'),
  'ProjectAssetBridge gates operational transition behind COMMISSIONED/OPERATIONAL status'
);
assert(
  projectAssetBridgeCode.includes('دارایی عملیاتی هنوز تشکیل نشده است'),
  'ProjectAssetBridge truthfully informs user that operational monitoring is unavailable before commissioning'
);

const assetDetailCode = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/solar-assets/AssetDetail.tsx'), 'utf8');
assert(
  assetDetailCode.includes('originatingProjectId') || assetDetailCode.includes('projectId'),
  'AssetDetail maintains contextual link back to originating EnergyProject'
);

const assetMonitoringCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/assets/passport/AssetMonitoringStatus.tsx'), 'utf8');
assert(
  assetMonitoringCode.includes('پایش برخط هنوز فعال نشده است'),
  'AssetMonitoringStatus displays truthful unconfigured message when monitoring is inactive'
);

const telemetryEmptyCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/TelemetryEmptyState.tsx'), 'utf8');
assert(
  telemetryEmptyCode.includes('داده کافی برای نمایش نمودار وجود ندارد') &&
  telemetryEmptyCode.includes('برای نمایش داده‌های عملیاتی، ابتدا منبع پایش نیروگاه باید متصل شود'),
  'TelemetryEmptyState displays truthful unrecorded message when telemetry data is unavailable'
);

// [4] ROUTE AUDIT & UX ARCHITECTURE VERIFICATION
console.log('\n[4] Route Audit & Global Application Shell:');
const routeAuditPath = path.join(ROOT_DIR, 'docs/UI10_ROUTE_AUDIT.md');
assert(fs.existsSync(routeAuditPath), 'docs/UI10_ROUTE_AUDIT.md exists and is documented');

const appCode = fs.readFileSync(path.join(ROOT_DIR, 'src/App.tsx'), 'utf8');
const expectedRoutes = [
  '/',
  '/dashboard',
  '/projects',
  '/projects/:id',
  '/solar-analysis',
  '/solar-assets',
  '/solar-assets/:id',
  '/portfolio',
  '/investment-hub',
  '/marketplace',
  '/contractors',
  '/contractor-dashboard',
  '/vendors',
  '/vendor-portal/*',
  '/technician-dashboard',
  '/smart-maintenance'
];
expectedRoutes.forEach(route => {
  assert(appCode.includes(`path="${route}"`), `App.tsx defines route: ${route}`);
});

// [5] MOBILE RESPONSIVENESS & TOUCH TARGET POLICIES
console.log('\n[5] Mobile Responsiveness & Viewport Integrity:');
const mobileNavCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/navigation/MobileBottomNav.tsx'), 'utf8');
assert(mobileNavCode.includes('min-h-[44px]'), 'MobileBottomNav enforces minimum 44px touch target height');
assert(mobileNavCode.includes('min-w-[44px]'), 'MobileBottomNav enforces minimum 44px touch target width');

const projectDetailCode = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/projects/ProjectDetail.tsx'), 'utf8');
assert(projectDetailCode.includes('pb-24') || projectDetailCode.includes('pb-20'), 'ProjectDetail provides bottom padding to prevent collision with mobile navigation');

const assetDetailPageCode = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/solar-assets/AssetDetail.tsx'), 'utf8');
assert(assetDetailPageCode.includes('pb-24') || assetDetailPageCode.includes('pb-20'), 'AssetDetail provides bottom padding to prevent collision with mobile navigation');

// [6] COMMERCIAL PRIVACY & AUTHORIZATION ENFORCEMENT
console.log('\n[6] Commercial Privacy & Backend Role Isolation:');
const maintBackendCode = fs.readFileSync(path.join(ROOT_DIR, 'src/api/maintenance.ts'), 'utf8');
assert(maintBackendCode.includes("!isAdmin && !isTechRole"), 'Maintenance backend strictly restricts technician cases to authorized technician or admin roles');
assert(maintBackendCode.includes("c.assignedTechnicianId === userId"), 'Maintenance backend filters cases strictly to assigned technician ID (No cross-technician IDOR)');

const rfqBackendCode = fs.readFileSync(path.join(ROOT_DIR, 'src/api/rfq.ts'), 'utf8');
assert(rfqBackendCode.includes('project.ownerId !== user.id && user.role !== \'admin\''), 'RFQ service preserves project ownership authorization boundary');

// [7] RECONFIRM IMMUTABILITY AT CONCLUSION OF TEST
console.log('\n[7] Concluding Immutability Check:');
const finalDbHash = sha256(fs.readFileSync(DB_PATH));
assert(finalDbHash === BASELINE_DB_HASH, 'db.json hash is intact after UI-10 test run');

const finalReportHash = sha256(fs.readFileSync(MIGRATION_REPORT_PATH));
assert(finalReportHash === BASELINE_REPORT_HASH, 'POSTGRES_MIGRATION_REPORT.md hash is intact after UI-10 test run');

console.log('========================================================================');
console.log(`UI-10 TEST SUITE RESULT: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL: ${passedCount + failedCount})`);
console.log('========================================================================');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
