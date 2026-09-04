const fs = require('fs');
let content = fs.readFileSync('src/pages/Result.tsx', 'utf-8');

content = content.replace(
  '{result.recommendedProducts.map',
  '{(result.recommendedProducts || []).map'
);

content = content.replace(
  '{result.requiredAccessories.map',
  '{(result.requiredAccessories || []).map'
);

fs.writeFileSync('src/pages/Result.tsx', content);
