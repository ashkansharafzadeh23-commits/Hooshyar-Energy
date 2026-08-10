const fs = require('fs');
let code = fs.readFileSync('src/pages/Result.tsx', 'utf-8');

if (!code.includes('<AdBanner layout="hero" />')) {
  code = code.replace(
    /<div className="w-full max-w-6xl h-full mx-auto flex flex-col pt-4">/,
    '<div className="w-full max-w-6xl h-full mx-auto flex flex-col pt-4">\n      <div className="w-full mb-2 shrink-0">\n        <AdBanner layout="hero" />\n      </div>'
  );
  fs.writeFileSync('src/pages/Result.tsx', code);
}
