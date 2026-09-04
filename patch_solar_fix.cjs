const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

content = content.replace(
  "https://images.unsplash.com/photo-1611365892502-8a9fa640f10c?q=80&w=2070&auto=format&fit=crop",
  "https://upload.wikimedia.org/wikipedia/commons/4/45/Berlin_pv-system_block-103_20050309_p1010367.jpg"
);

fs.writeFileSync('src/pages/Landing.tsx', content);
