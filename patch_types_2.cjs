const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf-8');

content = content.replace(
  'actualMonthlyKwh: number | null;',
  'actualMonthlyKwh: number | null;\n  notifications: AppNotification[];'
);

fs.writeFileSync('src/types.ts', content);
