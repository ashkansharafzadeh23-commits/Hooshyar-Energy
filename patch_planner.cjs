const fs = require('fs');
let code = fs.readFileSync('src/pages/SolarPlanner.tsx', 'utf-8');

// import PanelRecommendations
code = code.replace(
  /import \{ SunPathController \} from '..\/components\/solar\/SunPathController';/,
  "import { SunPathController } from '../components/solar/SunPathController';\nimport { PanelRecommendations } from '../components/solar/PanelRecommendations';"
);

// Insert <PanelRecommendations />
code = code.replace(
  /<SunPathController \/>/,
  "<SunPathController />\n          <PanelRecommendations />"
);

fs.writeFileSync('src/pages/SolarPlanner.tsx', code);
