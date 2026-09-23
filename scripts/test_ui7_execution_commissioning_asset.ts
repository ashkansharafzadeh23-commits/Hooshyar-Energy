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

console.log('========================================================');
console.log('HOOSHYAR ENERGY — UI-7 EXECUTION, COMMISSIONING & ASSET PASSPORT TEST SUITE');
console.log('========================================================');

const initialDbHash = getDbHash();

// [1] Execution Components
console.log('\n[1] Testing Component Architecture in src/components/execution/...');
const executionFiles = [
  'ExecutionWorkspace.tsx',
  'ExecutionOverview.tsx',
  'ExecutionStageNavigator.tsx',
  'ExecutionNextAction.tsx',
  'ExecutionAttentionItems.tsx',
  'MilestoneList.tsx',
  'MilestoneCard.tsx',
  'MilestoneDetail.tsx',
  'SiteActivityTimeline.tsx',
  'ExecutionDocuments.tsx',
  'EquipmentDeliverySummary.tsx',
  'CommissioningReadiness.tsx',
  'CommissioningChecklist.tsx',
  'CommissioningTestResult.tsx',
  'CommissioningReview.tsx',
  'HandoverReview.tsx',
  'ProjectToAssetTransition.tsx',
  'ExecutionEmptyState.tsx',
  'index.ts'
];

executionFiles.forEach(file => {
  const fullPath = path.join(ROOT_DIR, 'src/components/execution', file);
  assert(fs.existsSync(fullPath), `Execution component exists: ${file}`);
});

// [2] Asset Passport Components
console.log('\n[2] Testing Component Architecture in src/components/assets/passport/...');
const passportFiles = [
  'AssetPassport.tsx',
  'AssetIdentity.tsx',
  'AssetEquipmentRegistry.tsx',
  'AssetWarrantySummary.tsx',
  'AssetDocumentRegistry.tsx',
  'AssetCommissioningRecord.tsx',
  'AssetContractSummary.tsx',
  'AssetMonitoringStatus.tsx',
  'AssetMaintenanceHistory.tsx',
  'AssetHistoryTimeline.tsx',
  'index.ts'
];

passportFiles.forEach(file => {
  const fullPath = path.join(ROOT_DIR, 'src/components/assets/passport', file);
  assert(fs.existsSync(fullPath), `Passport component exists: ${file}`);
});

// [3] Page Integrations
console.log('\n[3] Testing Page Integrations & Workspace Mounting...');
const assetDetailPage = path.join(ROOT_DIR, 'src/pages/solar-assets/AssetDetail.tsx');
assert(fs.existsSync(assetDetailPage), 'SolarAssetDetail.tsx exists');
const assetDetailContent = fs.readFileSync(assetDetailPage, 'utf-8');
assert(assetDetailContent.includes('AssetPassport'), 'SolarAssetDetail mounts AssetPassport component');
assert(!assetDetailContent.includes('mockPerformanceData'), 'SolarAssetDetail removed fabricated mockPerformanceData');

const assetTabFile = path.join(ROOT_DIR, 'src/pages/projects/Workspace/AssetTab.tsx');
assert(fs.existsSync(assetTabFile), 'AssetTab.tsx exists');
const assetTabContent = fs.readFileSync(assetTabFile, 'utf-8');
assert(assetTabContent.includes('ProjectToAssetTransition'), 'AssetTab mounts ProjectToAssetTransition');
assert(assetTabContent.includes('AssetPassport'), 'AssetTab mounts AssetPassport');

const commTabFile = path.join(ROOT_DIR, 'src/pages/projects/Workspace/CommissioningTab.tsx');
assert(fs.existsSync(commTabFile), 'CommissioningTab.tsx exists');
const commTabContent = fs.readFileSync(commTabFile, 'utf-8');
assert(commTabContent.includes('CommissioningReadiness'), 'CommissioningTab mounts CommissioningReadiness');
assert(commTabContent.includes('CommissioningChecklist'), 'CommissioningTab mounts CommissioningChecklist');
assert(commTabContent.includes('CommissioningReview'), 'CommissioningTab mounts CommissioningReview');

const handoverTabFile = path.join(ROOT_DIR, 'src/pages/projects/Workspace/HandoverTab.tsx');
assert(fs.existsSync(handoverTabFile), 'HandoverTab.tsx exists');
const handoverTabContent = fs.readFileSync(handoverTabFile, 'utf-8');
assert(handoverTabContent.includes('HandoverReview'), 'HandoverTab mounts HandoverReview');
assert(handoverTabContent.includes('ProjectToAssetTransition'), 'HandoverTab mounts ProjectToAssetTransition');

const milestonesTabFile = path.join(ROOT_DIR, 'src/pages/projects/Workspace/MilestonesTab.tsx');
assert(fs.existsSync(milestonesTabFile), 'MilestonesTab.tsx exists');
const milestonesTabContent = fs.readFileSync(milestonesTabFile, 'utf-8');
assert(milestonesTabContent.includes('MilestoneList'), 'MilestonesTab mounts MilestoneList');

// [4] Data Truthfulness
console.log('\n[4] Testing Non-Negotiable Data-Truth Rules & Silent Defaults Removal...');
[...executionFiles.map(f => path.join('src/components/execution', f)), ...passportFiles.map(f => path.join('src/components/assets/passport', f))].forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    assert(!content.includes('Math.random()'), `No Math.random() in ${path.basename(relPath)}`);
  }
});

const transitionContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/execution/ProjectToAssetTransition.tsx'), 'utf-8');
assert(transitionContent.includes('این پروژه هنوز دارایی عملیاتی نیست'), 'ProjectToAssetTransition contains truthful not-yet-operational statement');
assert(transitionContent.includes('دارایی عملیاتی ایجاد شد'), 'ProjectToAssetTransition displays confirmed asset state');

const monitoringContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/assets/passport/AssetMonitoringStatus.tsx'), 'utf-8');
assert(monitoringContent.includes('پایش برخط هنوز فعال نشده است'), 'AssetMonitoringStatus contains truthful offline/unconnected message');

const equipmentContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/assets/passport/AssetEquipmentRegistry.tsx'), 'utf-8');
assert(equipmentContent.includes('اطلاعات تجهیزات این دارایی هنوز ثبت نشده است'), 'AssetEquipmentRegistry contains truthful empty state');
assert(equipmentContent.includes('شماره سریال ثبت نشده'), 'AssetEquipmentRegistry indicates missing serial number truthfully');

const warrantyContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/assets/passport/AssetWarrantySummary.tsx'), 'utf-8');
assert(warrantyContent.includes('اطلاعات گارانتی برای این دارایی ثبت نشده است'), 'AssetWarrantySummary contains truthful empty state');

// [5] Database Byte-for-Byte Immutability Guard
console.log('\n[5] Testing Database Byte-for-Byte Immutability Guard...');
const finalDbHash = getDbHash();
assert(initialDbHash === finalDbHash, 'db.json hash unchanged during test execution');
assert(finalDbHash === BASELINE_HASH, `db.json strictly preserves baseline hash (${BASELINE_HASH.substring(0, 16)}...)`);

console.log('========================================================');
console.log(`UI-7 TEST SUITE RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================');

if (failed > 0) {
  process.exit(1);
}
