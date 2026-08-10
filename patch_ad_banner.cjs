const fs = require('fs');
let code = fs.readFileSync('src/components/AdBanner.tsx', 'utf-8');
code = code.replace(
  /export function AdBanner\(\) \{/,
  "export function AdBanner({ layout = 'banner' }: { layout?: 'banner' | 'card' | 'inline' }) {"
);

// We need to change the return statement to support different layouts.
fs.writeFileSync('src/components/AdBanner.tsx', code);
