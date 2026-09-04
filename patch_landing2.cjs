const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

// Add import
content = content.replace(
  "import { Link } from 'react-router-dom';",
  "import { Link } from 'react-router-dom';\nimport { NotificationCenter } from '../components/NotificationCenter';"
);

// Add to header section (absolute positioned on top right)
content = content.replace(
  '<div className="text-center z-10 w-full max-w-4xl px-4 flex flex-col items-center">',
  `<div className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
        <NotificationCenter />
      </div>
      <div className="text-center z-10 w-full max-w-4xl px-4 flex flex-col items-center">`
);

fs.writeFileSync('src/pages/Landing.tsx', content);
