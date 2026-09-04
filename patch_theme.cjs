const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');

// Update UserFlowState interface in types
let types = fs.readFileSync('src/types.ts', 'utf-8');
if (!types.includes('theme:')) {
  types = types.replace(
    'export interface UserFlowState {',
    "export interface UserFlowState {\n  theme: 'light' | 'dark';"
  );
  fs.writeFileSync('src/types.ts', types);
}

// Update AppContext initialState
content = content.replace(
  'const initialState: UserFlowState = {',
  "const initialState: UserFlowState = {\n  theme: 'light',"
);

// Add toggleTheme method to interface
content = content.replace(
  'resetState: () => void;',
  'resetState: () => void;\n  toggleTheme: () => void;'
);

// Add toggleTheme implementation
const impl = `
  const toggleTheme = () => {
    setState(prev => {
      const newTheme = prev.theme === 'light' ? 'dark' : 'light';
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { ...prev, theme: newTheme };
    });
  };

  const resetState`;

content = content.replace('const resetState', impl);

content = content.replace(
  'resetState, markNotificationAsRead',
  'resetState, toggleTheme, markNotificationAsRead'
);

fs.writeFileSync('src/context/AppContext.tsx', content);
