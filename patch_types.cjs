const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf-8');

content += `
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  date: string;
}
`;

fs.writeFileSync('src/types.ts', content);
