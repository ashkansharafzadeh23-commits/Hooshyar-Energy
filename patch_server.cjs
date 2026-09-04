const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  'import analyzeHandler from "./api/analyze.js";',
  'import analyzeHandler from "./api/analyze.js";\nimport followupHandler from "./api/followup.js";'
);
code = code.replace(
  'app.post("/api/analyze", verifyAuthToken, async (req, res) => {',
  'app.post("/api/analyze/followup", verifyAuthToken, async (req, res) => {\n  const user = req.user;\n  // For simplicity, we just pass to handler, but we could save history here too.\n  const originalJson = res.json.bind(res);\n  res.json = function (body) {\n    if (user && res.statusCode === 200 && body.updatedResult) {\n      db.addHistory({\n        userId: user.id,\n        input: body.updatedInput,\n        resultSummary: "پیگیری: " + body.reply,\n        fullResult: body.updatedResult,\n      });\n    }\n    return originalJson(body);\n  };\n  await runVercelHandler(followupHandler)(req, res);\n});\n\napp.post("/api/analyze", verifyAuthToken, async (req, res) => {'
);
fs.writeFileSync('server.ts', code);
