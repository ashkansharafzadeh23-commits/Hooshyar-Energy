const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const targetStr = `<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-10">
        <button
          onClick={() => toggleTarget('solar')}
          className={\`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-4 hover:shadow-lg \${
            state.targets.includes('solar')
              ? 'border-[var(--solar-primary)] bg-[var(--solar-secondary)]/10 shadow-[0_4px_20px_rgba(255,158,44,0.2)]'
              : 'border-gray-200 hover:border-[var(--solar-primary)] bg-white'
          }\`}
        >
          <div className="w-16 h-16 rounded-full bg-[var(--solar-secondary)]/20 flex items-center justify-center text-[var(--solar-primary)]">
            <Sun size={32} />
          </div>
          <span className="font-semibold text-lg">پنل خورشیدی</span>
        </button>
        <button
          onClick={() => toggleTarget('generator')}
          className={\`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-4 hover:shadow-lg \${
            state.targets.includes('generator')
              ? 'border-[var(--generator-primary)] bg-[var(--generator-secondary)]/20 shadow-[0_4px_20px_rgba(31,138,92,0.2)]'
              : 'border-gray-200 hover:border-[var(--generator-primary)] bg-white'
          }\`}
        >
          <div className="w-16 h-16 rounded-full bg-[var(--generator-secondary)]/50 flex items-center justify-center text-[var(--generator-primary)]">
            <Zap size={32} />
          </div>
          <span className="font-semibold text-lg">موتور برق / ژنراتور</span>
        </button>
        <button
          onClick={() => toggleTarget('powerbank')}
          className={\`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-4 hover:shadow-lg \${
            state.targets.includes('powerbank')
              ? 'border-[var(--powerbank-primary)] bg-[var(--powerbank-secondary)] shadow-[0_4px_20px_rgba(76,95,213,0.2)]'
              : 'border-gray-200 hover:border-[var(--powerbank-primary)] bg-white'
          }\`}
        >
          <div className="w-16 h-16 rounded-full bg-[var(--powerbank-secondary)] flex items-center justify-center text-[var(--powerbank-primary)]">
            <BatteryCharging size={32} />
          </div>
          <span className="font-semibold text-lg text-center">پاوربانک خانگی<br/>و صنعتی</span>
        </button>
      </div>`;

const newCode = `<div className="flex flex-col gap-4 w-full mb-10">
        <button
          onClick={() => toggleTarget('solar')}
          className={\`relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 font-bold text-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 \${
            state.targets.includes('solar')
              ? 'border-[var(--solar-primary)] bg-white shadow-[0_4px_20px_rgba(255,158,44,0.2)] text-[var(--solar-primary)]'
              : 'border-gray-200 hover:border-[var(--solar-primary)] bg-white text-gray-700'
          }\`}
        >
          <Sun size={24} className={state.targets.includes('solar') ? "text-[var(--solar-primary)] animate-pulse" : "text-gray-400"} />
          <span>خرید پنل خورشیدی</span>
        </button>
        <button
          onClick={() => toggleTarget('generator')}
          className={\`relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 font-bold text-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 \${
            state.targets.includes('generator')
              ? 'border-[var(--generator-primary)] bg-white shadow-[0_4px_20px_rgba(31,138,92,0.2)] text-[var(--generator-primary)]'
              : 'border-gray-200 hover:border-[var(--generator-primary)] bg-white text-gray-700'
          }\`}
        >
          <Zap size={24} className={state.targets.includes('generator') ? "text-[var(--generator-primary)] animate-pulse" : "text-gray-400"} />
          <span>خرید موتور برق / ژنراتور</span>
        </button>
        <button
          onClick={() => toggleTarget('powerbank')}
          className={\`relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 font-bold text-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 \${
            state.targets.includes('powerbank')
              ? 'border-[var(--powerbank-primary)] bg-white shadow-[0_4px_20px_rgba(76,95,213,0.2)] text-[var(--powerbank-primary)]'
              : 'border-gray-200 hover:border-[var(--powerbank-primary)] bg-white text-gray-700'
          }\`}
        >
          <BatteryCharging size={24} className={state.targets.includes('powerbank') ? "text-[var(--powerbank-primary)] animate-pulse" : "text-gray-400"} />
          <span>خرید پاوربانک خانگی و صنعتی</span>
        </button>
      </div>`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newCode);
    fs.writeFileSync('src/pages/Home.tsx', code);
    console.log("Patched successfully");
} else {
    console.log("Target string not found");
}
