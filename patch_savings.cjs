const fs = require('fs');
let content = fs.readFileSync('src/components/SavingsCalculator.tsx', 'utf-8');

content = content.replace(/border-\[\#E4E7EC\]/g, 'border-zinc-200');
content = content.replace(/text-\[\#1A1D23\]/g, 'text-zinc-950');
content = content.replace(/text-\[\#1F9254\]/g, 'text-emerald-500');
content = content.replace(/bg-\[\#1F9254\]\/5/g, 'bg-emerald-50');
content = content.replace(/border-\[\#1F9254\]\/20/g, 'border-emerald-200');
content = content.replace(/text-\[\#5A6072\]/g, 'text-zinc-500');
content = content.replace(/text-base font-black text-\[\#1F9254\]/g, 'text-base font-black text-emerald-600');
content = content.replace(/bg-blue-50/g, 'bg-zinc-50');
content = content.replace(/border-blue-100/g, 'border-zinc-200');
content = content.replace(/text-blue-600/g, 'text-zinc-600');
content = content.replace(/text-blue-700/g, 'text-zinc-700');

fs.writeFileSync('src/components/SavingsCalculator.tsx', content);
