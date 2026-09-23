import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT_DIR = process.cwd();
const BASELINE_HASH = 'de1c80c200b77dbbcdbb6fd077bced308b76969c9026ceb2715d21e2c92409c2';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function getDbHash(): string {
  const dbPath = path.join(ROOT_DIR, 'db.json');
  const content = fs.readFileSync(dbPath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

console.log('========================================================================');
console.log('HOOSHYAR ENERGY — UI-8 SMART MONITORING & OPERATIONS DATA-TRUTH TEST');
console.log('========================================================================');

const initialDbHash = getDbHash();
assert(initialDbHash === BASELINE_HASH, `Initial db.json hash matches baseline (${BASELINE_HASH})`);

// [1] Component Architecture
console.log('\n[1] Testing Component Architecture in src/components/operations/...');
const operationsFiles = [
  'OperationsNavigation.tsx',
  'MonitoringConnectionStatus.tsx',
  'TelemetrySourceCard.tsx',
  'TelemetrySourceList.tsx',
  'TelemetryMetricCard.tsx',
  'TelemetryChart.tsx',
  'TelemetryTimeRangeSelector.tsx',
  'TelemetryEmptyState.tsx',
  'DataFreshnessIndicator.tsx',
  'OperationalHealthCard.tsx',
  'AlertCard.tsx',
  'AlertDetails.tsx',
  'AlertEmptyState.tsx',
  'AnomalyCard.tsx',
  'AnomalyEvidence.tsx',
  'AnomalyDiagnosis.tsx',
  'AlertCenter.tsx',
  'MaintenanceTimeline.tsx',
  'MaintenanceEmptyState.tsx',
  'MaintenanceCaseCard.tsx',
  'MaintenanceCaseDetails.tsx',
  'TechnicianMatchCard.tsx',
  'TechnicianMatchList.tsx',
  'TechnicianAssignmentReview.tsx',
  'MaintenanceCenter.tsx',
  'AssetMaintenanceHistory.tsx',
  'AssetOperationsOverview.tsx',
  'OperationsEmptyState.tsx',
  'AssetOperationsWorkspace.tsx',
  'index.ts'
];

operationsFiles.forEach(file => {
  const fullPath = path.join(ROOT_DIR, 'src/components/operations', file);
  assert(fs.existsSync(fullPath), `Operations component exists: ${file}`);
});

// [2] Data-Truth Principle in Monitoring & Telemetry
console.log('\n[2] Testing Data-Truth Principle in Monitoring & Telemetry...');
const monitoringStatusContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/MonitoringConnectionStatus.tsx'), 'utf-8');
assert(monitoringStatusContent.includes('پایش برخط هنوز فعال نشده است'), 'Truthful unconfigured monitoring state');
assert(monitoringStatusContent.includes('برای این دارایی هنوز منبع داده پایش برخط ثبت یا تأیید نشده است'), 'Truthful unconfigured explanation');
assert(monitoringStatusContent.includes('وضعیت اتصال منبع پایش مشخص نیست'), 'Truthful unknown connection state');

const emptyTelemetryContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/TelemetryEmptyState.tsx'), 'utf-8');
assert(emptyTelemetryContent.includes('داده کافی برای نمایش نمودار وجود ندارد'), 'Truthful empty chart message');
assert(emptyTelemetryContent.includes('برای نمایش داده‌های عملیاتی، ابتدا منبع پایش نیروگاه باید متصل شود'), 'Truthful source required message');

const metricCardContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/TelemetryMetricCard.tsx'), 'utf-8');
assert(metricCardContent.includes('داده در دسترس نیست'), 'Metric card renders truthful missing state instead of fake zero');

// [3] Telemetry Source Transparency
console.log('\n[3] Testing Telemetry Source Transparency...');
const sourceCardContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/TelemetrySourceCard.tsx'), 'utf-8');
assert(sourceCardContent.includes('پروتکل ثبت نشده است'), 'Protocol fallback is truthful, not fabricated Modbus');
assert(!sourceCardContent.includes('Modbus TCP/IP'), 'No hardcoded fake Modbus protocol');

// [4] Data Freshness Classifications
console.log('\n[4] Testing Data Freshness Classifications...');
const freshnessContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/DataFreshnessIndicator.tsx'), 'utf-8');
assert(freshnessContent.includes('داده زنده و همگام'), 'Supports live and synced freshness badge');
assert(freshnessContent.includes('تأخیر در دریافت داده'), 'Supports delayed reading badge');
assert(freshnessContent.includes('داده متوقف / فاقد تله‌متری'), 'Supports stale/stopped reading badge');
assert(freshnessContent.includes('داده تستی شبیه‌سازی‌شده'), 'Explicitly flags test/synthetic data');
assert(freshnessContent.includes('داده تله‌متری ثبت نشده است'), 'Truthful no-telemetry badge');

// [5] Operational Health & Alerts Truthfulness
console.log('\n[5] Testing Operational Health & Alerts Truthfulness...');
const alertEmptyContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/AlertEmptyState.tsx'), 'utf-8');
assert(alertEmptyContent.includes('هشدار ثبت‌شده‌ای برای این بازه نمایش داده نمی‌شود'), 'Truthful empty alert message (not "سیستم هیچ مشکلی ندارد")');
assert(!alertEmptyContent.includes('نیروگاه هیچ مشکلی ندارد'), 'Does NOT claim zero problems when alert list is empty');

const anomalyCardContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/AnomalyCard.tsx'), 'utf-8');
assert(anomalyCardContent.includes('مشاهده ثبت‌شده:'), 'Anomaly headline explicitly states observed fact');
assert(anomalyCardContent.includes('بر اساس داده‌های موجود، این وضعیت می‌تواند نیازمند بررسی باشد'), 'Truthful anomaly interpretation wording');
assert(!anomalyCardContent.includes('اینورتر خراب است'), 'Does not claim definite equipment failure without verified evidence');

// [6] Maintenance Center & Technician Matching Truthfulness
console.log('\n[6] Testing Maintenance Center & Technician Matching Truthfulness...');
const maintenanceEmptyContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/MaintenanceEmptyState.tsx'), 'utf-8');
assert(maintenanceEmptyContent.includes('پرونده تعمیراتی ثبت‌شده‌ای برای این دارایی وجود ندارد'), 'Truthful empty maintenance state');

const matchCardContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/TechnicianMatchCard.tsx'), 'utf-8');
assert(!matchCardContent.includes('بهترین تکنسین'), 'Does not claim subjective "بهترین تکنسین"');
assert(matchCardContent.includes('معیارهای انطباق ثبت‌شده:'), 'Factual match criteria heading');

const matchListContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/TechnicianMatchList.tsx'), 'utf-8');
assert(matchListContent.includes('تکنسین‌های پیشنهادی بر اساس معیارهای ثبت‌شده'), 'Truthful list title');

const maintenanceCaseContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/MaintenanceCaseCard.tsx'), 'utf-8');
assert(maintenanceCaseContent.includes('هزینه ثبت نشده است'), 'Truthful missing cost phrasing (never 0 or رایگان)');
assert(maintenanceCaseContent.includes('تکنسین تخصیص داده نشده است'), 'Truthful missing technician phrasing');

const historyContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/operations/AssetMaintenanceHistory.tsx'), 'utf-8');
assert(historyContent.includes('نتیجه تعمیر ثبت نشده است'), 'Truthful missing resolution phrasing');
assert(historyContent.includes('سابقه نگهداری ثبت‌شده‌ای برای این دارایی وجود ندارد'), 'Truthful empty history message');

// [7] Technician Dashboard Refactoring Verification
console.log('\n[7] Testing Technician Dashboard Refactoring...');
const techDashboardContent = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/technician/Dashboard.tsx'), 'utf-8');
assert(!techDashboardContent.includes('mockRequests'), 'All hardcoded mockRequests removed from Dashboard.tsx');
assert(!techDashboardContent.includes('شرکت آریان مهر'), 'Fake customer removed');
assert(!techDashboardContent.includes('۱۲,۵۰۰,۰۰۰'), 'Hardcoded fake income removed');
assert(techDashboardContent.includes('/api/technician/cases'), 'Fetches real maintenance cases from API');

// [8] Integration in SolarAssetDetail
console.log('\n[8] Testing SolarAssetDetail Integration...');
const assetDetailContent = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/solar-assets/AssetDetail.tsx'), 'utf-8');
assert(assetDetailContent.includes('AssetOperationsWorkspace'), 'AssetOperationsWorkspace integrated into SolarAssetDetail');
assert(assetDetailContent.includes('مرکز عملیات و پایش (Operations Center)'), 'Operations switcher integrated');
assert(assetDetailContent.includes('شناسنامه فنی دارایی (Asset Passport)'), 'Asset Passport switcher preserved');

// [9] Database Immutability Check
console.log('\n[9] Checking db.json Immutability...');
const finalDbHash = getDbHash();
assert(finalDbHash === BASELINE_HASH, `Final db.json hash matches baseline (${BASELINE_HASH})`);

console.log('\n========================================================');
console.log(`UI-8 TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================');

if (failed > 0) {
  process.exit(1);
}
