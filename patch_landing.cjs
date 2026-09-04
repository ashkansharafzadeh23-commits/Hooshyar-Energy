const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

// Modernize the hero section
content = content.replace(/bg-gradient-to-br from-\[\#0A0F1C\] via-\[\#12182B\] to-\[\#1A233A\]/g, 'bg-zinc-950');
content = content.replace(/from-\[\#12B76A\] to-\[\#FF9E2C\]/g, 'from-emerald-400 to-emerald-200');
content = content.replace(/bg-\[\#1F9254\]/g, 'bg-emerald-600');
content = content.replace(/bg-white\/20/g, 'bg-emerald-700/50');
content = content.replace(/hover:bg-\[\#167643\]/g, 'hover:bg-emerald-500');
content = content.replace(/shadow-\[0_8px_24px_rgba\(31,146,84,0.4\)\]/g, 'shadow-emerald-600/20 shadow-xl');
content = content.replace(/text-\[\#1A1D23\]/g, 'text-zinc-900');
content = content.replace(/bg-\[\#FF9E2C\]\/10 text-\[\#FF9E2C\]/g, 'bg-zinc-100 text-zinc-900');

// Features section
content = content.replace(/bg-white rounded-3xl p-6 shadow-xl border border-\[\#E4E7EC\]/g, 'bg-white rounded-3xl p-8 shadow-premium border border-zinc-200');
content = content.replace(/bg-\[\#1F9254\]\/10 text-\[\#1F9254\]/g, 'bg-emerald-50 text-emerald-600');

fs.writeFileSync('src/pages/Landing.tsx', content);
