const fs = require('fs');
let code = fs.readFileSync('src/pages/SmartMaintenance.tsx', 'utf-8');

// Need to replace the `mockExperts` initialization with a state or just an effect if we don't want it to be static, 
// but we can just use `useEffect` and `useState` to load from localStorage.
if (!code.includes('const [experts, setExperts] = useState')) {
  // Let's check if `useEffect` is imported. If not, add it.
  if (!code.includes('useEffect')) {
    code = code.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");
  }

  // Replace mockExperts array definition
  const mockExpertsStr = `  const mockExperts = [
    { id: 1, name: 'مهندس احمدی', profession: 'متخصص سیستم‌های خورشیدی', exp: '۱۰ سال تجربه', photo: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'علی رضایی', profession: 'تعمیرکار ژنراتور و موتور برق', exp: '۱۵ سال تجربه', photo: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'سارا محمدی', profession: 'کارشناس باتری و یو‌پی‌اس', exp: '۸ سال تجربه', photo: 'https://i.pravatar.cc/150?u=3' }
  ];`;

  const newExpertsStr = `  const [experts, setExperts] = useState([
    { id: 1, name: 'مهندس احمدی', profession: 'متخصص سیستم‌های خورشیدی', exp: '۱۰ سال تجربه', photo: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'علی رضایی', profession: 'تعمیرکار ژنراتور و موتور برق', exp: '۱۵ سال تجربه', photo: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'سارا محمدی', profession: 'کارشناس باتری و یو‌پی‌اس', exp: '۸ سال تجربه', photo: 'https://i.pravatar.cc/150?u=3' }
  ]);

  useEffect(() => {
    const localTechs = JSON.parse(localStorage.getItem('registered_technicians') || '[]');
    if (localTechs.length > 0) {
      setExperts(prev => [...localTechs, ...prev]);
    }
  }, []);`;

  code = code.replace(mockExpertsStr, newExpertsStr);
  
  // Replace `mockExperts.map` with `experts.map`
  code = code.replace(/mockExperts\.map/g, 'experts.map');
  
  fs.writeFileSync('src/pages/SmartMaintenance.tsx', code);
}
