const fs = require('fs');
let code = fs.readFileSync('src/pages/AreaCity.tsx', 'utf-8');

if (!code.includes('AdBanner')) {
  code = code.replace(
    /import \{ motion \} from 'framer-motion';/,
    "import { motion } from 'framer-motion';\nimport { AdBanner } from '../components/AdBanner';"
  );
  
  code = code.replace(
    /<\/motion\.div>/,
    "  <div className=\"mt-8 w-full max-w-2xl mx-auto\"><AdBanner layout=\"inline\" /></div>\n    </motion.div>"
  );
  fs.writeFileSync('src/pages/AreaCity.tsx', code);
}
