const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Replace standard colors with zinc palette and refined design
content = content.replace(/border-gray-200/g, 'border-zinc-200');
content = content.replace(/text-gray-700/g, 'text-zinc-800');
content = content.replace(/text-gray-600/g, 'text-zinc-500 font-medium');
content = content.replace(/text-gray-400/g, 'text-zinc-400');
content = content.replace(/bg-gray-200/g, 'bg-zinc-100');

// Fix button styles (the toggle ones)
// Replace heavy shadows with elegant drop-shadows
content = content.replace(/shadow-\[0_4px_20px_rgba[^\]]+\]/g, 'shadow-premium ring-2');
content = content.replace(/border-2/g, 'border');

// Upgrade "Next" button
content = content.replace(/bg-blue-600 text-white hover:bg-blue-700/g, 'bg-zinc-900 text-white hover:bg-zinc-800');
content = content.replace(/text-3xl sm:text-4xl font-bold mb-4/g, 'text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-4');

// Dashboard button
content = content.replace(/text-blue-600 border-2 border-blue-600/g, 'text-zinc-900 border border-zinc-200');
content = content.replace(/hover:bg-blue-50/g, 'hover:bg-zinc-50');

// Maintenance button
content = content.replace(/bg-gradient-to-r from-blue-600 to-indigo-600/g, 'bg-zinc-900');
content = content.replace(/hover:from-blue-700 hover:to-indigo-700/g, 'hover:bg-zinc-800');

// Solar plant setup button
content = content.replace(/bg-gradient-to-r from-amber-500 to-orange-500/g, 'bg-white border border-zinc-200 text-zinc-900');
content = content.replace(/hover:from-amber-600 hover:to-orange-600/g, 'hover:bg-zinc-50');
content = content.replace(/text-white px-8 py-4 rounded-2xl font-bold text-xl hover:from-amber-600 hover:to-orange-600/g, 'text-zinc-900 px-8 py-4 rounded-2xl font-bold text-xl hover:bg-zinc-50');

fs.writeFileSync('src/pages/Home.tsx', content);
