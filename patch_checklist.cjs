const fs = require('fs');

let code = fs.readFileSync('src/pages/Checklist.tsx', 'utf8');

// Add import for SmartAnalyzer
code = code.replace(
  /import \{ motion \} from 'framer-motion';/,
  "import { motion } from 'framer-motion';\nimport SmartAnalyzer from '../components/SmartAnalyzer';"
);

// Add the component right after `<div className="mb-8">...</div>` (line 144 approx)
const analyzerHtml = `
      <SmartAnalyzer 
        area={state.area || 100} 
        onAnalysisComplete={(consumption) => {
          if (consumption > 0) {
            updateState({ monthlyConsumptionKwh: consumption });
          }
        }} 
      />
`;

code = code.replace(
  /<\/div>\n\n      \{locationConfig\.subtypes && \(/,
  `</div>\n${analyzerHtml}\n      {locationConfig.subtypes && (`
);

fs.writeFileSync('src/pages/Checklist.tsx', code);
