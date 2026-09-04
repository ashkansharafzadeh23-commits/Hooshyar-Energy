const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');

// Add import
content = content.replace(
  "import { NotificationCenter } from '../components/NotificationCenter';",
  "import { NotificationCenter } from '../components/NotificationCenter';\nimport { ThemeToggle } from '../components/ThemeToggle';"
);

// Add ThemeToggle next to NotificationCenter
content = content.replace(
  '<NotificationCenter />',
  '<ThemeToggle />\n            <NotificationCenter />'
);

// Add dark mode classes
content = content.replace(/bg-\[\#F7F8FA\]/g, 'bg-[#F7F8FA] dark:bg-zinc-950');
content = content.replace(/bg-white\/80/g, 'bg-white/80 dark:bg-zinc-900/80');
content = content.replace(/border-zinc-200\/80/g, 'border-zinc-200/80 dark:border-zinc-800/80');
content = content.replace(/bg-zinc-100/g, 'bg-zinc-100 dark:bg-zinc-800');
content = content.replace(/hover:bg-zinc-200/g, 'hover:bg-zinc-200 dark:hover:bg-zinc-700');
content = content.replace(/text-zinc-900/g, 'text-zinc-900 dark:text-zinc-100');
content = content.replace(/text-zinc-500/g, 'text-zinc-500 dark:text-zinc-400');
content = content.replace(/bg-zinc-200/g, 'bg-zinc-200 dark:bg-zinc-800');
content = content.replace(/bg-zinc-900 shadow-\[0_0_8px_rgba\(255,255,255,0.5\)\]/g, 'bg-zinc-900 dark:bg-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.5)] dark:shadow-[0_0_8px_rgba(0,0,0,0.5)]');

content = content.replace(/bg-white/g, 'bg-white dark:bg-zinc-900');
content = content.replace(/border-\[\#E4E7EC\]/g, 'border-[#E4E7EC] dark:border-zinc-800');
content = content.replace(/text-\[\#5A6072\]/g, 'text-[#5A6072] dark:text-zinc-400');

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
