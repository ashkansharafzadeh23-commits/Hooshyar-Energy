const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

code = code.replace(
  "import { Home, Factory, Warehouse, Tractor, LayoutDashboard, UserPlus, LogIn, Wrench, FileText, Settings, ShoppingCart, Sun, MapPin, Search } from 'lucide-react';",
  "import { Home, Factory, Warehouse, Tractor, LayoutDashboard, UserPlus, LogIn, Wrench, FileText, Settings, ShoppingCart, Sun, MapPin, Search, Layers, AlertTriangle } from 'lucide-react';"
);

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
