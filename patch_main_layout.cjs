const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');

// Add import
content = content.replace(
  "import { Outlet, useLocation, useNavigate } from 'react-router-dom';",
  "import { Outlet, useLocation, useNavigate } from 'react-router-dom';\nimport { NotificationCenter } from '../components/NotificationCenter';"
);

// We need to replace the second part of the header.
const currentHeaderRightSide = `{isFlow && location.pathname !== '/target-select' && state.locationType && (
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">پیشرفت تحلیل</div>
                <div className="w-32 sm:w-48 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-zinc-900 shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-500" 
                    style={{ width: location.pathname === '/result' ? '100%' : '50%' }}
                  ></div>
                </div>
              </div>
              <button 
                onClick={handleReset}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200/80 shadow-sm border border-white/30 px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors shrink-0 whitespace-nowrap"
              >
                تغییر نوع مکان ✏️
              </button>
            </div>
          )}`;

const newHeaderRightSide = `<div className="flex items-center gap-2 sm:gap-4">
            {isFlow && location.pathname !== '/target-select' && state.locationType && (
              <div className="flex items-center gap-4 sm:gap-6 ml-2 sm:ml-4 border-l border-zinc-200/80 pl-2 sm:pl-4">
                <div className="hidden sm:flex flex-col items-end">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">پیشرفت تحلیل</div>
                  <div className="w-32 sm:w-48 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-zinc-900 shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-500" 
                      style={{ width: location.pathname === '/result' ? '100%' : '50%' }}
                    ></div>
                  </div>
                </div>
                <button 
                  onClick={handleReset}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200/80 shadow-sm px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors shrink-0 whitespace-nowrap"
                >
                  تغییر نوع مکان ✏️
                </button>
              </div>
            )}
            <NotificationCenter />
          </div>`;

content = content.replace(currentHeaderRightSide, newHeaderRightSide);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
