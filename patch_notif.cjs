const fs = require('fs');
let content = fs.readFileSync('src/components/NotificationCenter.tsx', 'utf-8');

content = content.replace(
  'className="relative p-2 rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors focus:outline-none"',
  'className="relative p-2 rounded-full text-inherit hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none"'
);

fs.writeFileSync('src/components/NotificationCenter.tsx', content);
