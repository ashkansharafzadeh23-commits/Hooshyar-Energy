const fs = require('fs');
let code = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import CustomerLogin from './pages/CustomerLogin';
import Home from './pages/Home';
import LocationTypePage from './pages/LocationType';
import AreaCityPage from './pages/AreaCity';
import ChecklistPage from './pages/Checklist';
import ConsumptionPage from './pages/Consumption';
import ResultPage from './pages/Result';
import VendorsList from './pages/VendorsList';
import SellersList from './pages/SellersList';
import AdsPortal from './pages/AdsPortal';
import SmartMaintenance from './pages/SmartMaintenance';
import TechnicianAuth from './pages/TechnicianAuth';
import TechnicianDashboard from './pages/technician/Dashboard';
import VendorAuth from './pages/VendorAuth';
import TechniciansList from './pages/TechniciansList';
import VendorPortal from './pages/vendor/VendorPortal';
import VendorStorefront from './pages/vendor/VendorStorefront';
import SolarPlanner from './pages/SolarPlanner';
import PowerPlantSetup from './pages/PowerPlantSetup';
import MainLayout from './layouts/MainLayout';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<MainLayout />}>
            <Route path="/customer-login" element={<CustomerLogin />} />
            <Route path="/powerplant-setup" element={<PowerPlantSetup />} />
            <Route path="/solar-planner" element={<SolarPlanner />} />
            <Route path="/target-select" element={<Home />} />
            <Route path="/location-type" element={<LocationTypePage />} />
            <Route path="/area-city" element={<AreaCityPage />} />
            <Route path="/checklist" element={<ChecklistPage />} />
            <Route path="/consumption" element={<ConsumptionPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/sellers" element={<SellersList />} />
            <Route path="/vendors" element={<VendorsList />} />
            <Route path="/ads-portal" element={<AdsPortal />} />
            <Route path="/smart-maintenance" element={<SmartMaintenance />} />
            <Route path="/technician-auth" element={<TechnicianAuth />} />
            <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
            <Route path="/vendor-auth" element={<VendorAuth />} />
            <Route path="/technicians-list" element={<TechniciansList />} />
            <Route path="/vendor/:id" element={<VendorStorefront />} />
            <Route path="/vendor-portal/*" element={<VendorPortal />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
`;
fs.writeFileSync('src/App.tsx', code);
