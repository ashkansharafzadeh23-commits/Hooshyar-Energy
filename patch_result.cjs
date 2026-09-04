const fs = require('fs');
let content = fs.readFileSync('src/pages/Result.tsx', 'utf-8');

// Colors replacement
content = content.replace(/#F7F8FA/g, '#F4F4F5'); // zinc-100
content = content.replace(/#E4E7EC/g, '#E4E4E7'); // zinc-200
content = content.replace(/#1A1D23/g, '#09090B'); // zinc-950
content = content.replace(/#5A6072/g, '#71717A'); // zinc-500
content = content.replace(/#1F9254/g, '#10B981'); // emerald-500
content = content.replace(/#12151B/g, '#09090B'); // zinc-950
content = content.replace(/#D64545/g, '#EF4444'); // red-500
content = content.replace(/#F5A623/g, '#F59E0B'); // amber-500

// Update bento grid shadows and borders
content = content.replace(/shadow-sm/g, 'shadow-premium');
content = content.replace(/border border-\[\#E4E4E7\]/g, 'border border-zinc-200');
content = content.replace(/bg-white rounded-2xl/g, 'bg-white rounded-[20px]');
content = content.replace(/text-\[\#09090B\]/g, 'text-zinc-950');
content = content.replace(/text-\[\#71717A\]/g, 'text-zinc-500');

fs.writeFileSync('src/pages/Result.tsx', content);
