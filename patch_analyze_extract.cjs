const fs = require('fs');
let code = fs.readFileSync('api/analyze.js', 'utf8');

const startMarker = `// 3.1 اعتبارسنجی ورودی`;
const endMarker = `// 3.3 فراخوانی Claude API`;

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

const logic = code.substring(startIndex, endIndex);

let newCode = code.substring(0, startIndex);
newCode += `export async function runRuleEngine(body) {\n  const req = { body }; // mock req for compatibility\n  let resError = null;\n  const res = {\n    status: (code) => ({\n      json: (data) => { resError = { status: code, data }; return resError; }\n    })\n  };\n\n`;

// Indent logic
const indentedLogic = logic.split('\n').map(l => '  ' + l).join('\n');
newCode += indentedLogic;
newCode += `\n  if (resError) return { error: resError };\n  return { engineResult };\n}\n\n`;
newCode += startMarker + `\n  const ruleRes = await runRuleEngine(req.body);\n  if (ruleRes.error) return res.status(ruleRes.error.status).json(ruleRes.error.data);\n  const engineResult = ruleRes.engineResult;\n\n`;
newCode += endMarker + code.substring(endIndex + endMarker.length);

fs.writeFileSync('api/analyze.js', newCode);
console.log("Patched api/analyze.js successfully");
