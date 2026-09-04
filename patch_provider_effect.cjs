const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');

// Add useEffect import
content = content.replace(
  "import React, { createContext, useContext, useState, ReactNode } from 'react';",
  "import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';"
);

const effect = `
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);
`;

content = content.replace(
  'const updateState = (updates: Partial<UserFlowState>) => {',
  effect + '\n  const updateState = (updates: Partial<UserFlowState>) => {'
);

fs.writeFileSync('src/context/AppContext.tsx', content);
