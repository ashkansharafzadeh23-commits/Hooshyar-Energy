const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace("import { AppProvider } from './context/AppContext';\nimport { GlobalBackButton } from './components/GlobalBackButton';", "import { AppProvider } from './context/AppContext';");
code = code.replace("<BrowserRouter>\n        <GlobalBackButton />", "<BrowserRouter>");

fs.writeFileSync('src/App.tsx', code);
