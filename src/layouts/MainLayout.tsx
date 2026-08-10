import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Home, Factory, Warehouse, Tractor, LayoutDashboard, UserPlus, LogIn, Wrench, FileText, Settings, ShoppingCart, Sun, MapPin, Search } from 'lucide-react';

export default function MainLayout() {
  const { state, resetState } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  // Calculate dominant color based on target
  let bgGradient = 'linear-gradient(to left, #60A5FA, #3B82F6, #2563EB)';
  if (state.targets.includes('solar') || location.pathname.includes('solar') || location.pathname.includes('powerplant')) {
    bgGradient = 'linear-gradient(to left, var(--solar-secondary), var(--solar-primary), var(--solar-accent))';
  } else if (state.targets.includes('generator')) {
    bgGradient = 'linear-gradient(to left, var(--generator-secondary), var(--generator-primary), #0F6B45)';
  } else if (state.targets.includes('powerbank')) {
    bgGradient = 'linear-gradient(to left, var(--powerbank-secondary), var(--powerbank-primary), var(--powerbank-accent))';
  }

  const handleReset = () => {
    resetState();
    navigate('/target-select');
  };

  const getPageInfo = () => {
    if (location.pathname.startsWith('/target-select')) return { label: 'انتخاب هدف', icon: <Search size={24} />, isFlow: false };
    if (location.pathname.startsWith('/customer-login')) return { label: 'ورود مشتری', icon: <LogIn size={24} />, isFlow: false };
    if (location.pathname.startsWith('/powerplant-setup')) return { label: 'احداث نیروگاه', icon: <Sun size={24} />, isFlow: false };
    if (location.pathname.startsWith('/solar-planner')) return { label: 'شبیه‌ساز سه‌بعدی', icon: <Sun size={24} />, isFlow: false };
    if (location.pathname.startsWith('/vendors')) return { label: 'فروشگاه‌ها', icon: <ShoppingCart size={24} />, isFlow: false };
    if (location.pathname.startsWith('/ads-portal')) return { label: 'ثبت آگهی', icon: <FileText size={24} />, isFlow: false };
    if (location.pathname.startsWith('/smart-maintenance')) return { label: 'تعمیرات هوشمند', icon: <Settings size={24} />, isFlow: false };
    if (location.pathname.startsWith('/technician-auth')) return { label: 'ورود متخصص', icon: <UserPlus size={24} />, isFlow: false };
    if (location.pathname.startsWith('/technician-dashboard')) return { label: 'داشبورد متخصص', icon: <LayoutDashboard size={24} />, isFlow: false };
    if (location.pathname.startsWith('/vendor-auth')) return { label: 'ورود فروشنده', icon: <UserPlus size={24} />, isFlow: false };
    if (location.pathname.startsWith('/technicians-list')) return { label: 'متخصصین', icon: <Wrench size={24} />, isFlow: false };
    if (location.pathname.startsWith('/vendor/')) return { label: 'پروفایل فروشگاه', icon: <ShoppingCart size={24} />, isFlow: false };
    if (location.pathname.startsWith('/vendor-portal')) return { label: 'پرتال فروشندگان', icon: <LayoutDashboard size={24} />, isFlow: false };

    // Default flow pages
    let icon = <Home size={24} />;
    let label = 'خانه مسکونی';
    
    switch (state.locationType) {
      case 'residential': icon = <Home size={24} />; label = 'خانه مسکونی'; break;
      case 'industrial_warehouse': icon = <Warehouse size={24} />; label = 'سوله صنعتی'; break;
      case 'factory': icon = <Factory size={24} />; label = 'کارخانه'; break;
      case 'agricultural': icon = <Tractor size={24} />; label = 'زمین کشاورزی'; break;
      default: label = 'انتخاب مکان'; break;
    }

    return { label, icon, isFlow: true };
  };

  const handleBack = () => {
    if (location.pathname === '/target-select') { navigate('/'); return; }
    if (location.pathname === '/customer-login') { navigate('/'); return; }
    if (location.pathname === '/location-type') { navigate('/target-select'); return; }
    if (location.pathname === '/powerplant-setup') { navigate('/target-select'); return; }
    if (location.pathname === '/smart-maintenance') { navigate('/target-select'); return; }
    if (location.pathname === '/vendors') { navigate('/target-select'); return; }
    if (location.pathname === '/ads-portal') { navigate('/vendors'); return; }
    if (location.pathname === '/technicians-list') { navigate('/vendors'); return; }
    if (location.pathname === '/contractors') { navigate(-1); return; }
    if (location.pathname === '/contractor-dashboard') { navigate('/vendors'); return; }
    if (location.pathname === '/user-dashboard') { navigate('/target-select'); return; }
    if (location.pathname === '/technician-auth') { navigate('/target-select'); return; }
    if (location.pathname === '/vendor-auth') { navigate('/target-select'); return; }
    if (location.pathname === '/contractor-auth') { navigate('/target-select'); return; }
    
    if (location.pathname === '/area-city') { navigate('/location-type'); return; }
    if (location.pathname === '/checklist') { navigate('/area-city'); return; }
    if (location.pathname === '/consumption') { navigate('/checklist'); return; }
    if (location.pathname === '/result') { navigate('/consumption'); return; }
    if (location.pathname === '/sellers') { navigate('/result'); return; }
    if (location.pathname === '/solar-planner') { navigate('/checklist'); return; }
    
    navigate(-1);
  };

  const { label, icon, isFlow } = getPageInfo();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      {location.pathname !== '/' && (
        <header 
          className="sticky top-0 z-50 h-16 w-full text-white px-4 sm:px-6 flex items-center justify-between shadow-lg"
          style={{ background: bgGradient }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={handleBack}
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors shrink-0 text-xs font-bold"
            >
              بازگشت
            </button>
            <div className="bg-white/20 p-2 rounded-lg shrink-0 hidden sm:block">
              {icon}
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-lg font-bold leading-none">{label}</h1>
              {isFlow && state.city && <span className="text-[10px] sm:text-xs opacity-80 font-medium mt-1">موقعیت: {state.city}</span>}
            </div>
          </div>
          
          {isFlow && location.pathname !== '/target-select' && state.locationType && (
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <div className="text-[10px] uppercase tracking-wider opacity-80 mb-1">پیشرفت تحلیل</div>
                <div className="w-32 sm:w-48 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-500" 
                    style={{ width: location.pathname === '/result' ? '100%' : '50%' }}
                  ></div>
                </div>
              </div>
              <button 
                onClick={handleReset}
                className="bg-white/10 hover:bg-white/20 border border-white/30 px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors shrink-0 whitespace-nowrap"
              >
                تغییر نوع مکان ✏️
              </button>
            </div>
          )}
        </header>
      )}
      
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      {location.pathname === '/result' && (
        <footer className="h-10 bg-white border-t border-[#E4E7EC] flex items-center justify-center px-4 sm:px-6 gap-4 sm:gap-8 shrink-0">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-[#5A6072]">
            <span className="w-2 h-2 rounded-full bg-[#1F9254]"></span>
            اتصال به دیتابیس قیمت لحظه‌ای برقرار است
          </div>
          <div className="h-3 w-px bg-[#E4E7EC] hidden sm:block"></div>
          <div className="text-[10px] sm:text-xs text-[#5A6072] hidden sm:block">مشاور هوشمند انرژی | قدرت گرفته از مدل‌های پیشرفته</div>
        </footer>
      )}
    </div>
  );
}
