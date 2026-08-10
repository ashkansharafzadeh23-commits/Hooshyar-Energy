const fs = require('fs');
let code = fs.readFileSync('src/pages/technician/Dashboard.tsx', 'utf-8');

if (!code.includes('AdBanner')) {
  code = code.replace(
    /import { Link } from 'react-router-dom';/,
    "import { Link } from 'react-router-dom';\nimport { AdBanner } from '../../components/AdBanner';"
  );
  
  code = code.replace(
    /<\/div>\n          <\/div>\n          \n        <\/div>\n      <\/main>/,
    "</div>\n            <div className=\"mt-6\">\n              <AdBanner layout=\"sidebar\" />\n            </div>\n          </div>\n          \n        </div>\n      </main>"
  );

  fs.writeFileSync('src/pages/technician/Dashboard.tsx', code);
}
