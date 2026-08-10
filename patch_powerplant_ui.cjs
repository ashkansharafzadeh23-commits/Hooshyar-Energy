const fs = require('fs');
let code = fs.readFileSync('src/pages/PowerPlantSetup.tsx', 'utf-8');

const targetState = `  const [formData, setFormData] = useState({
    area: '',
    city: '',
    budget: ''
  });`;

const newState = `  const [formData, setFormData] = useState({
    area: '',
    city: '',
    budget: '',
    budgetUnit: 'million',
    connectionType: 'on-grid',
    roofType: 'flat',
    phase: '3-phase'
  });`;

code = code.replace(targetState, newState);

const targetInputs = `            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">مساحت زمین (متر مربع)</label>
                <div className="relative">
                  <input required name="area" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} type="number" dir="ltr" className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800 text-right" placeholder="مثال: 5000" />
                  <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">استان و شهر محل احداث</label>
                <div className="relative">
                  <input required name="city" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} type="text" className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800" placeholder="مثال: کرمان، بم" />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">بودجه تقریبی (میلیون تومان)</label>
                <div className="relative">
                  <input required name="budget" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} type="number" dir="ltr" className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800 text-right" placeholder="مثال: 2000" />
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>`;

const newInputs = `            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">مساحت زمین/سقف (متر مربع)</label>
                <div className="relative">
                  <input required name="area" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} type="number" dir="ltr" className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800 text-right" placeholder="مثال: 5000" />
                  <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">استان و شهر محل احداث</label>
                <div className="relative">
                  <input required name="city" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} type="text" className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800" placeholder="مثال: کرمان، بم" />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">بودجه تقریبی</label>
                <div className="flex relative rounded-xl border border-gray-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 transition-all overflow-hidden bg-white">
                  <select 
                    value={formData.budgetUnit} 
                    onChange={e => setFormData({...formData, budgetUnit: e.target.value})}
                    className="bg-gray-50 border-l border-gray-200 px-3 py-3 text-sm font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="million">میلیون تومان</option>
                    <option value="billion">میلیارد تومان</option>
                  </select>
                  <input required name="budget" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} type="number" dir="ltr" className="flex-1 px-4 py-3 outline-none font-medium text-gray-800 text-right" placeholder="مثال: 2000" />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Wallet size={18} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نوع اتصال به شبکه</label>
                <select 
                  value={formData.connectionType}
                  onChange={e => setFormData({...formData, connectionType: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800 bg-white"
                >
                  <option value="on-grid">متصل به شبکه (On-Grid) - فروش برق</option>
                  <option value="off-grid">منفصل از شبکه (Off-Grid) - تامین برق شخصی</option>
                  <option value="hybrid">هیبرید (Hybrid) - ترکیب هر دو</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">محل نصب پنل‌ها</label>
                <select 
                  value={formData.roofType}
                  onChange={e => setFormData({...formData, roofType: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800 bg-white"
                >
                  <option value="flat">سقف مسطح (ایزوگام/موزاییک)</option>
                  <option value="sloped">سقف شیب‌دار (شیروانی/سفال)</option>
                  <option value="ground">نصب روی زمین (پایه کوبی)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">فاز شبکه برق محلی</label>
                <select 
                  value={formData.phase}
                  onChange={e => setFormData({...formData, phase: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800 bg-white"
                >
                  <option value="3-phase">سه فاز (صنعتی / مجتمع)</option>
                  <option value="1-phase">تک فاز (خانگی)</option>
                </select>
              </div>
            </div>`;

code = code.replace(targetInputs, newInputs);
fs.writeFileSync('src/pages/PowerPlantSetup.tsx', code);
