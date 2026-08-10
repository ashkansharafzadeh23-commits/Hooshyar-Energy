const fs = require('fs');
let code = fs.readFileSync('src/pages/SolarPlanner.tsx', 'utf-8');

if (!code.includes('AdBanner')) {
  code = code.replace(
    /import { Link } from 'react-router-dom';/,
    "import { Link } from 'react-router-dom';\nimport { AdBanner } from '../components/AdBanner';"
  );
  fs.writeFileSync('src/pages/SolarPlanner.tsx', code);
}
