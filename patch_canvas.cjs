const fs = require('fs');
let code = fs.readFileSync('src/components/solar/SceneCanvas.tsx', 'utf-8');

code = code.replace(/sc\.set\('#fffdeb'\);\s*ac\.set\('#a6c1e3'\);/g, "sc.set('#fffdeb');\n      ac.set('#bae6fd');");

code = code.replace(/turbidity=\{.*?\}/, "turbidity={((timeOfDay >= 5 && timeOfDay < 8) || (timeOfDay >= 16 && timeOfDay < 19)) ? 8 : (isNight ? 1 : 0.5)}");
code = code.replace(/rayleigh=\{.*?\}/, "rayleigh={isNight ? 0.1 : 0.8}");

fs.writeFileSync('src/components/solar/SceneCanvas.tsx', code);
