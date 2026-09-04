const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

content = content.replace(/bg-white/g, 'bg-white dark:bg-zinc-900');
content = content.replace(/text-zinc-900/g, 'text-zinc-900 dark:text-zinc-100');
content = content.replace(/text-zinc-800/g, 'text-zinc-800 dark:text-zinc-200');
content = content.replace(/border-zinc-200/g, 'border-zinc-200 dark:border-zinc-800');
content = content.replace(/bg-zinc-100/g, 'bg-zinc-100 dark:bg-zinc-800');
content = content.replace(/bg-zinc-50/g, 'bg-zinc-50 dark:bg-zinc-800');
content = content.replace(/text-zinc-500/g, 'text-zinc-500 dark:text-zinc-400');
content = content.replace(/text-zinc-400/g, 'text-zinc-400 dark:text-zinc-500');

content = content.replace(/bg-zinc-900 text-white hover:bg-zinc-800/g, 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200');
content = content.replace(/bg-zinc-900 text-white/g, 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900');
content = content.replace(/text-white bg-zinc-900/g, 'text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100');
content = content.replace(/hover:bg-zinc-800/g, 'hover:bg-zinc-800 dark:hover:bg-zinc-200');

fs.writeFileSync('src/pages/Home.tsx', content);
