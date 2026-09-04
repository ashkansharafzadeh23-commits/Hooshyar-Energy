const fs = require('fs');
let content = fs.readFileSync('src/components/EnergyEfficiencyChart.tsx', 'utf-8');

content = content.replace(/bg-white/g, 'bg-white dark:bg-zinc-900');
content = content.replace(/border-zinc-200/g, 'border-zinc-200 dark:border-zinc-800');
content = content.replace(/text-zinc-950/g, 'text-zinc-950 dark:text-zinc-100');
content = content.replace(/text-zinc-500/g, 'text-zinc-500 dark:text-zinc-400');
content = content.replace(/bg-zinc-100/g, 'bg-zinc-100 dark:bg-zinc-800');
content = content.replace(/bg-emerald-50/g, 'bg-emerald-50 dark:bg-emerald-900/30');
content = content.replace(/border-emerald-100/g, 'border-emerald-100 dark:border-emerald-900/50');
content = content.replace(/text-emerald-700/g, 'text-emerald-700 dark:text-emerald-400');

fs.writeFileSync('src/components/EnergyEfficiencyChart.tsx', content);
