const fs = require('fs');

let code = fs.readFileSync('src/pages/technician/Dashboard.tsx', 'utf8');

// The original `{activeTab !== 'profile' && (<div className="lg:col-span-2 space-y-6">` needs to be closed.
// Let's find exactly the div before `<div className="space-y-6">`.
// The problem is that the parenthesis `)` is missing after the closing `</div>` of `lg:col-span-2 space-y-6`.

code = code.replace(
  /<\/div>\n          \n          <div className="space-y-6">/g,
  `</div>\n          )}\n          \n          <div className="space-y-6">`
);

fs.writeFileSync('src/pages/technician/Dashboard.tsx', code);
