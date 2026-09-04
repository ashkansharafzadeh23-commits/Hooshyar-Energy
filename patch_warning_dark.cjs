const fs = require('fs');
let content = fs.readFileSync('src/components/SmartWarning.tsx', 'utf-8');

content = content.replace(/bg-white/g, 'bg-white dark:bg-zinc-900');
content = content.replace(/border-zinc-200/g, 'border-zinc-200 dark:border-zinc-800');
content = content.replace(/bg-zinc-50/g, 'bg-zinc-50 dark:bg-zinc-800/50');
content = content.replace(/text-zinc-950/g, 'text-zinc-950 dark:text-zinc-100');
content = content.replace(/text-zinc-500/g, 'text-zinc-500 dark:text-zinc-400');
content = content.replace(/bg-zinc-900/g, 'bg-zinc-900 dark:bg-zinc-100');
content = content.replace(/hover:bg-zinc-800/g, 'hover:bg-zinc-800 dark:hover:bg-white');
content = content.replace(/text-white/g, 'text-white dark:text-zinc-900');
content = content.replace(/bg-red-50 text-red-600/g, 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400');
content = content.replace(/bg-blue-50 text-blue-600/g, 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400');
content = content.replace(/bg-green-50 text-green-600/g, 'bg-green-50 dark:bg-emerald-900/30 text-green-600 dark:text-emerald-400');

fs.writeFileSync('src/components/SmartWarning.tsx', content);
