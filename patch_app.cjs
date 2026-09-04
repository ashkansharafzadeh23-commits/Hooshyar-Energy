const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import PowerPlantSetup from './pages/PowerPlantSetup';",
  "import PowerPlantSetup from './pages/PowerPlantSetup';\nimport SolarAssetsList from './pages/solar-assets/AssetList';\nimport SolarAssetDetail from './pages/solar-assets/AssetDetail';\nimport MyProjects from './pages/solar-assets/MyProjects';\nimport AdminReview from './pages/solar-assets/AdminReview';"
);

code = code.replace(
  '<Route path="/powerplant-setup" element={<PowerPlantSetup />} />',
  '<Route path="/powerplant-setup" element={<PowerPlantSetup />} />\n            <Route path="/solar-assets" element={<SolarAssetsList />} />\n            <Route path="/solar-assets/my-projects" element={<MyProjects />} />\n            <Route path="/solar-assets/:id" element={<SolarAssetDetail />} />\n            <Route path="/admin/solar-assets" element={<AdminReview />} />'
);

fs.writeFileSync('src/App.tsx', code);
