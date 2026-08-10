const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace("import { AppProvider } from './context/AppContext';", "import { AppProvider } from './context/AppContext';\nimport { GlobalBackButton } from './components/GlobalBackButton';");

code = code.replace("<BrowserRouter>", "<BrowserRouter>\n        <GlobalBackButton />");

fs.writeFileSync('src/App.tsx', code);
