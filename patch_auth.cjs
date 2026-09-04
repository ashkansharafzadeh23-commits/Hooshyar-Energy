const fs = require('fs');
let content = fs.readFileSync('src/api/auth.ts', 'utf-8');

const typeAugmentation = `
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
`;

content = typeAugmentation + '\n' + content;
fs.writeFileSync('src/api/auth.ts', content);
