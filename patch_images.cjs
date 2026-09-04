const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

// Hero background (beautiful solar panel at sunset)
content = content.replace(
  "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2072&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2500&auto=format&fit=crop"
);

// Showcase 1: Solar
content = content.replace(
  "https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1545208942-e0c9c7b419eb?q=80&w=2070&auto=format&fit=crop"
);

// Showcase 2: Generator (Industrial machine)
content = content.replace(
  "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=2070&auto=format&fit=crop"
);

fs.writeFileSync('src/pages/Landing.tsx', content);
