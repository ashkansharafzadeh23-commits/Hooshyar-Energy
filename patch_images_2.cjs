const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

// Replace Hero Background
content = content.replace(
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1548611716-10118eb30a21?q=80&w=2500&auto=format&fit=crop"
);

// Replace Solar Panels (to residential/roof type)
content = content.replace(
  "https://images.unsplash.com/photo-1545208942-e0c9c7b419eb?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611365892502-8a9fa640f10c?q=80&w=2070&auto=format&fit=crop"
);

// Replace Generator (to industrial motor/generator)
content = content.replace(
  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533575806655-32e65d83dcbf?q=80&w=2070&auto=format&fit=crop"
);

fs.writeFileSync('src/pages/Landing.tsx', content);
