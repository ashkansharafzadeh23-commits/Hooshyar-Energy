const fs = require('fs');
let content = fs.readFileSync('src/components/NotificationCenter.tsx', 'utf-8');

content = content.replace(/bg-white/g, 'bg-white dark:bg-zinc-900');
content = content.replace(/bg-zinc-50/g, 'bg-zinc-50 dark:bg-zinc-800');
content = content.replace(/border-zinc-200/g, 'border-zinc-200 dark:border-zinc-800');
content = content.replace(/border-zinc-100/g, 'border-zinc-100 dark:border-zinc-800');
content = content.replace(/border-zinc-50/g, 'border-zinc-50 dark:border-zinc-800/50');
content = content.replace(/text-zinc-900/g, 'text-zinc-900 dark:text-white');
content = content.replace(/text-zinc-700/g, 'text-zinc-700 dark:text-zinc-300');
content = content.replace(/text-zinc-600/g, 'text-zinc-600 dark:text-zinc-400');
content = content.replace(/text-zinc-500/g, 'text-zinc-500 dark:text-zinc-400');
content = content.replace(/text-zinc-400/g, 'text-zinc-400 dark:text-zinc-500');
content = content.replace(/bg-emerald-50\/30/g, 'bg-emerald-50/30 dark:bg-emerald-900/20');
content = content.replace(/hover:bg-emerald-50\/60/g, 'hover:bg-emerald-50/60 dark:hover:bg-emerald-900/40');

fs.writeFileSync('src/components/NotificationCenter.tsx', content);
