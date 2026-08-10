const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');

const oldHandleBack = `  const handleBack = () => {
    if (location.pathname === '/target-select') { navigate('/'); return; }
    if (location.pathname === '/location-type') { navigate('/target-select'); return; }
    if (location.pathname === '/area-city') { navigate('/location-type'); return; }
    if (location.pathname === '/checklist') { navigate('/area-city'); return; }
    if (location.pathname === '/consumption') { navigate('/checklist'); return; }
    if (location.pathname === '/result') { navigate('/consumption'); return; }
    if (location.pathname === '/sellers') { navigate('/result'); return; }
    if (location.pathname === '/solar-planner') { navigate('/checklist'); return; }
    navigate(-1);
  };`;

const newHandleBack = `  const handleBack = () => {
    if (location.pathname === '/target-select') { navigate('/'); return; }
    if (location.pathname === '/customer-login') { navigate('/'); return; }
    if (location.pathname === '/location-type') { navigate('/target-select'); return; }
    if (location.pathname === '/powerplant-setup') { navigate('/target-select'); return; }
    if (location.pathname === '/smart-maintenance') { navigate('/target-select'); return; }
    if (location.pathname === '/vendors') { navigate('/target-select'); return; }
    if (location.pathname === '/ads-portal') { navigate('/vendors'); return; }
    if (location.pathname === '/technicians-list') { navigate('/vendors'); return; }
    if (location.pathname === '/technician-auth') { navigate('/target-select'); return; }
    if (location.pathname === '/vendor-auth') { navigate('/target-select'); return; }
    
    if (location.pathname === '/area-city') { navigate('/location-type'); return; }
    if (location.pathname === '/checklist') { navigate('/area-city'); return; }
    if (location.pathname === '/consumption') { navigate('/checklist'); return; }
    if (location.pathname === '/result') { navigate('/consumption'); return; }
    if (location.pathname === '/sellers') { navigate('/result'); return; }
    if (location.pathname === '/solar-planner') { navigate('/checklist'); return; }
    
    navigate(-1);
  };`;

code = code.replace(oldHandleBack, newHandleBack);
fs.writeFileSync('src/layouts/MainLayout.tsx', code);
