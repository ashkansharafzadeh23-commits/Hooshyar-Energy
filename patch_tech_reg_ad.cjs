const fs = require('fs');
let code = fs.readFileSync('src/pages/TechnicianRegistration.tsx', 'utf-8');

if (!code.includes('AdBanner')) {
  code = code.replace(
    /import \{ motion \} from 'framer-motion';/,
    "import { motion } from 'framer-motion';\nimport { AdBanner } from '../components/AdBanner';"
  );
  
  code = code.replace(
    /<\/div>\n\s*<\/div>\n\s*\);/,
    "      </div>\n      <div className=\"mt-8\"><AdBanner layout=\"card\" /></div>\n    </div>\n  );"
  );
  fs.writeFileSync('src/pages/TechnicianRegistration.tsx', code);
}
