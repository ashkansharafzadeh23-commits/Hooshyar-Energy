const fs = require('fs');
let content = fs.readFileSync('src/components/SavingsCalculator.tsx', 'utf-8');

content = content.replace(/border-zinc-200/g, 'border-zinc-200 dark:border-zinc-800');
content = content.replace(/text-zinc-950/g, 'text-zinc-950 dark:text-zinc-100');
content = content.replace(/text-zinc-500/g, 'text-zinc-500 dark:text-zinc-400');
content = content.replace(/bg-emerald-50/g, 'bg-emerald-50 dark:bg-emerald-900/30');
content = content.replace(/border-emerald-200/g, 'border-emerald-200 dark:border-emerald-900/50');
content = content.replace(/text-emerald-500/g, 'text-emerald-500 dark:text-emerald-400');
content = content.replace(/text-emerald-600/g, 'text-emerald-600 dark:text-emerald-400');
content = content.replace(/bg-zinc-50/g, 'bg-zinc-50 dark:bg-zinc-800/50');
content = content.replace(/text-zinc-600/g, 'text-zinc-600 dark:text-zinc-300');
content = content.replace(/text-zinc-700/g, 'text-zinc-700 dark:text-zinc-200');

fs.writeFileSync('src/components/SavingsCalculator.tsx', content);
