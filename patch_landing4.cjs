const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

// Add import
content = content.replace(
  "import { NotificationCenter } from '../components/NotificationCenter';",
  "import { NotificationCenter } from '../components/NotificationCenter';\nimport { ThemeToggle } from '../components/ThemeToggle';"
);

// Add to absolute header
content = content.replace(
  '<NotificationCenter />',
  '<NotificationCenter />\n        <ThemeToggle />'
);

// Change container bg
content = content.replace('bg-[#F7F8FA]', 'bg-[#F7F8FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100');

// Update images
content = content.replace(
  "https://images.unsplash.com/photo-1592833159155-c62df1b65634?q=80&w=2072&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2072&auto=format&fit=crop"
);

content = content.replace(
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=2070&auto=format&fit=crop"
);

content = content.replace(
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2070&auto=format&fit=crop"
);

// Update dark mode classes
content = content.replace(/bg-white/g, 'bg-white dark:bg-zinc-900');
content = content.replace(/text-zinc-900/g, 'text-zinc-900 dark:text-white');
content = content.replace(/text-zinc-800/g, 'text-zinc-800 dark:text-zinc-200');
content = content.replace(/border-zinc-200/g, 'border-zinc-200 dark:border-zinc-800');
content = content.replace(/bg-zinc-100/g, 'bg-zinc-100 dark:bg-zinc-800');
content = content.replace(/text-zinc-500/g, 'text-zinc-500 dark:text-zinc-400');
content = content.replace(/bg-emerald-50 text-emerald-600/g, 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400');
content = content.replace(/bg-zinc-50\/50/g, 'bg-zinc-50/50 dark:bg-zinc-800/50');
content = content.replace(/to-\[\#F7F8FA\]/g, 'to-[#F7F8FA] dark:to-zinc-950');

// Fix specific overlaps if any
content = content.replace(/dark:bg-zinc-900\/10/g, 'bg-white/10 dark:bg-zinc-900/50');

fs.writeFileSync('src/pages/Landing.tsx', content);
