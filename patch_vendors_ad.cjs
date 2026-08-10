const fs = require('fs');
let code = fs.readFileSync('src/pages/VendorsList.tsx', 'utf-8');

if (!code.includes('AdBanner')) {
  code = code.replace(
    /import \{ motion \} from 'framer-motion';/,
    "import { motion } from 'framer-motion';\nimport { AdBanner } from '../components/AdBanner';"
  );
  
  code = code.replace(
    /<\/motion\.div>\n\s*<\/div>\n\s*\);/,
    "  <div className=\"mt-8\"><AdBanner layout=\"inline\" /></div>\n        </motion.div>\n      </div>\n    );"
  );
  fs.writeFileSync('src/pages/VendorsList.tsx', code);
}
