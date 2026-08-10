import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { TargetModule } from '../types';
import { Sun, Zap, BatteryCharging, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdBanner } from '../components/AdBanner';

export default function Home() {
  const { state, updateState } = useAppContext();
  const navigate = useNavigate();

  const toggleTarget = (target: TargetModule) => {
    const newTargets = state.targets.includes(target)
      ? state.targets.filter((t) => t !== target)
      : [...state.targets, target];
    updateState({ targets: newTargets });
  };

  const handleNext = () => {
    if (state.targets.length > 0) {
      navigate('/location-type');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center max-w-3xl mx-auto pt-10"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">کاربر عزیز، به مشاور هوشمند انرژی خوش آمدید</h1>
        <p className="text-gray-600 text-lg">هدف شما چیست؟ (می‌توانید چند مورد را انتخاب کنید)</p>
      </div>

      
      <AdBanner layout="hero" />
      
      <div className="w-full mb-6">
        <Link to="/user-dashboard" className="flex items-center justify-center gap-3 bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl w-full transform hover:-translate-y-1">
          <LayoutDashboard size={24} />
          ورود به داشبورد کاربری من (پیگیری درخواست‌ها)
        </Link>
      </div>
      <div className="mt-8 mb-4 w-full">
        <Link to="/smart-maintenance" className="flex items-center justify-center gap-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto transform hover:-translate-y-1">
          <Zap size={24} className="animate-pulse" />
          ورود به بخش تعمیرات و نگهداری هوشمند
        </Link>
      </div>

      <div className="w-full mb-6">
        <Link to="/powerplant-setup" className="flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl w-full transform hover:-translate-y-1">
          <Sun size={24} className="animate-pulse" />
          احداث نیروگاه برق خورشیدی (فروش برق)
        </Link>
      </div>
      <div className="flex flex-col gap-4 w-full mb-10">
        <button
          onClick={() => toggleTarget('solar')}
          className={`relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 font-bold text-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 ${
            state.targets.includes('solar')
              ? 'border-[var(--solar-primary)] bg-white shadow-[0_4px_20px_rgba(255,158,44,0.2)] text-[var(--solar-primary)]'
              : 'border-gray-200 hover:border-[var(--solar-primary)] bg-white text-gray-700'
          }`}
        >
          <Sun size={24} className={state.targets.includes('solar') ? "text-[var(--solar-primary)] animate-pulse" : "text-gray-400"} />
          <span>خرید پنل خورشیدی</span>
        </button>
        <button
          onClick={() => toggleTarget('generator')}
          className={`relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 font-bold text-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 ${
            state.targets.includes('generator')
              ? 'border-[var(--generator-primary)] bg-white shadow-[0_4px_20px_rgba(31,138,92,0.2)] text-[var(--generator-primary)]'
              : 'border-gray-200 hover:border-[var(--generator-primary)] bg-white text-gray-700'
          }`}
        >
          <Zap size={24} className={state.targets.includes('generator') ? "text-[var(--generator-primary)] animate-pulse" : "text-gray-400"} />
          <span>خرید موتور برق / ژنراتور</span>
        </button>
        <button
          onClick={() => toggleTarget('powerbank')}
          className={`relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 font-bold text-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 ${
            state.targets.includes('powerbank')
              ? 'border-[var(--powerbank-primary)] bg-white shadow-[0_4px_20px_rgba(76,95,213,0.2)] text-[var(--powerbank-primary)]'
              : 'border-gray-200 hover:border-[var(--powerbank-primary)] bg-white text-gray-700'
          }`}
        >
          <BatteryCharging size={24} className={state.targets.includes('powerbank') ? "text-[var(--powerbank-primary)] animate-pulse" : "text-gray-400"} />
          <span>خرید پاوربانک خانگی و صنعتی</span>
        </button>
      </div>
      <button
        onClick={handleNext}
        disabled={state.targets.length === 0}
        className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
          state.targets.length > 0 
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg cursor-pointer' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        مرحله بعد
        <ArrowLeft size={20} />
      </button>
    </motion.div>
  );
}
