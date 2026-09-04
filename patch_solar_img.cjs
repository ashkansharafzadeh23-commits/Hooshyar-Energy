const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

content = content.replace(
  "https://images.unsplash.com/photo-1545208942-e0c9c7b419eb?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611365892502-8a9fa640f10c?q=80&w=2070&auto=format&fit=crop"
);

fs.writeFileSync('src/pages/Landing.tsx', content);
