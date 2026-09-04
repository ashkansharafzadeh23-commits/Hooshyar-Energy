const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

content = content.replace(
  '<div className="relative z-10 max-w-3xl mx-auto mt-12 sm:mt-0 flex flex-col items-center">',
  `<div className="absolute top-4 left-4 z-50 bg-white/10 text-white backdrop-blur-md rounded-full border border-white/20 shadow-lg">
        <NotificationCenter />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto mt-12 sm:mt-0 flex flex-col items-center">`
);

fs.writeFileSync('src/pages/Landing.tsx', content);
