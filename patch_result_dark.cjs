const fs = require('fs');
let content = fs.readFileSync('src/pages/Result.tsx', 'utf-8');

content = content.replace(/bg-white/g, 'bg-white dark:bg-zinc-900');
content = content.replace(/text-zinc-950/g, 'text-zinc-950 dark:text-zinc-100');
content = content.replace(/text-zinc-900/g, 'text-zinc-900 dark:text-zinc-100');
content = content.replace(/text-zinc-500/g, 'text-zinc-500 dark:text-zinc-400');
content = content.replace(/border-zinc-200/g, 'border-zinc-200 dark:border-zinc-800');
content = content.replace(/bg-\[\#F4F4F5\]/g, 'bg-[#F4F4F5] dark:bg-zinc-800');
content = content.replace(/from-\[\#F7F8FA\] to-white/g, 'from-[#F7F8FA] to-white dark:from-zinc-900 dark:to-zinc-950');

fs.writeFileSync('src/pages/Result.tsx', content);
