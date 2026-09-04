const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('/api/energy/analyze-images')) {
  code = code.replace(
    /import recommendHandler from "\.\/api\/energy\/recommend\.js";/,
    'import recommendHandler from "./api/energy/recommend.js";\nimport analyzeImagesHandler from "./api/energy/analyze-images.js";'
  );

  code = code.replace(
    /app\.post\("\/api\/energy\/recommend", runVercelHandler\(recommendHandler\)\);/,
    'app.post("/api/energy/recommend", runVercelHandler(recommendHandler));\napp.post("/api/energy/analyze-images", runVercelHandler(analyzeImagesHandler));'
  );
  
  fs.writeFileSync('server.ts', code);
}
