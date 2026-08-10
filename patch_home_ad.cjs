const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

if (!code.includes('AdBanner')) {
  code = code.replace(
    /import \{ motion \} from 'framer-motion';/,
    "import { motion } from 'framer-motion';\nimport { AdBanner } from '../components/AdBanner';"
  );
  
  code = code.replace(
    /<div className="mt-8 mb-4 w-full">/,
    "<AdBanner layout=\"inline\" />\n      <div className=\"mt-8 mb-4 w-full\">"
  );
  fs.writeFileSync('src/pages/Home.tsx', code);
}
