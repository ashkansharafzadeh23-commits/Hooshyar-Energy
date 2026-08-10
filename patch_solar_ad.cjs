const fs = require('fs');
let code = fs.readFileSync('src/pages/SolarPlanner.tsx', 'utf-8');

if (!code.includes('AdBanner')) {
  code = code.replace(
    /import \{ Canvas \} from '@react-three\/fiber';/,
    "import { Canvas } from '@react-three/fiber';\nimport { AdBanner } from '../components/AdBanner';"
  );
  
  code = code.replace(
    /<\/div>\n\s*<\/div>\n\s*\);/,
    "      <div className=\"mt-8\"><AdBanner layout=\"banner\" /></div>\n      </div>\n    </div>\n  );"
  );
  fs.writeFileSync('src/pages/SolarPlanner.tsx', code);
}
