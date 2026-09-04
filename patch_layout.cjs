const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');

// Replace the header background logic
content = content.replace(
  /let bgGradient = 'linear-gradient[^;]+;[\s\S]*?bgGradient = 'linear-gradient[^;]+;[ \t]*\}/g,
  `let themeColor = '#3B82F6';
  if (state.targets.includes('solar') || location.pathname.includes('solar') || location.pathname.includes('powerplant')) {
    themeColor = 'var(--solar-primary)';
  } else if (state.targets.includes('generator')) {
    themeColor = 'var(--generator-primary)';
  } else if (state.targets.includes('powerbank')) {
    themeColor = 'var(--powerbank-primary)';
  }`
);

// Update header class
content = content.replace(
  /<header[\s\S]*?className="sticky top-0 z-50 h-16 w-full text-white px-4 sm:px-6 flex items-center justify-between shadow-lg"[\s\S]*?style=\{\{ background: bgGradient \}\}/g,
  `<header 
          className="sticky top-0 z-50 h-[72px] w-full bg-white/80 backdrop-blur-lg border-b border-zinc-200/80 px-4 sm:px-8 flex items-center justify-between shadow-sm"
`
);

// Remove text-white dependency inside header by replacing hardcoded colors
content = content.replace(/bg-white\/10 hover:bg-white\/20/g, 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200/80 shadow-sm');
content = content.replace(/text-white/g, 'text-zinc-900');
content = content.replace(/bg-white\/20/g, 'bg-zinc-100 border border-zinc-200/80');
content = content.replace(/bg-white\/30/g, 'bg-zinc-200');
content = content.replace(/bg-white shadow/g, 'bg-zinc-900 shadow'); // progress bar
content = content.replace(/text-\[10px\] uppercase tracking-wider opacity-80 mb-1/g, 'text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1');

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
