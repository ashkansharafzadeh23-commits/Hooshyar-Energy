const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

content = content.replace(
  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2070&auto=format&fit=crop"
);

fs.writeFileSync('src/pages/Landing.tsx', content);
