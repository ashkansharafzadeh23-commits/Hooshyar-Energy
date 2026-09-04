const fs = require('fs');
let content = fs.readFileSync('src/components/SmartWarning.tsx', 'utf-8');

content = content.replace(/border-\[\#E4E7EC\]/g, 'border-zinc-200');
content = content.replace(/shadow-sm/g, 'shadow-premium');
content = content.replace(/text-gray-800/g, 'text-zinc-950');
content = content.replace(/text-gray-600/g, 'text-zinc-500');
content = content.replace(/bg-gray-50/g, 'bg-zinc-50');
content = content.replace(/border-gray-100/g, 'border-zinc-200');
content = content.replace(/text-gray-500/g, 'text-zinc-500');
content = content.replace(/bg-gray-900/g, 'bg-zinc-900');
content = content.replace(/hover:bg-blue-600/g, 'hover:bg-zinc-800');

fs.writeFileSync('src/components/SmartWarning.tsx', content);
