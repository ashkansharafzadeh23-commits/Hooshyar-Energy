const fs = require('fs');
let code = fs.readFileSync('src/pages/Result.tsx', 'utf8');

code = code.replace(
  "import { Check, Info, AlertTriangle, ExternalLink, Zap, Share, Map, Lightbulb, MessageSquare, Send } from 'lucide-react';",
  "import { Check, Info, AlertTriangle, ExternalLink, Zap, Share, Map, Lightbulb, MessageSquare, Send, Save, Trash2 } from 'lucide-react';"
);

code = code.replace(
  "const [diffSummary, setDiffSummary] = useState<any>(null);",
  "const [diffSummary, setDiffSummary] = useState<any>(null);\n  const [savedScenarios, setSavedScenarios] = useState<{name: string, monthlySunHours: Record<string, number>, systemKwp: number}[]>([]);"
);

// Add the handleSaveScenario function
const handleSaveStr = `
  const handleSaveScenario = () => {
    const defaultName = \`سناریو \${savedScenarios.length + 1}\`;
    const name = window.prompt("نام سناریو را وارد کنید (مثلاً: پنل ۵۵۰ وات، ظرفیت ۵ کیلووات):", defaultName);
    if (name) {
      setSavedScenarios(prev => [...prev, {
        name,
        monthlySunHours: result.dataSource.monthlySunHours,
        systemKwp: result.solar.finalKwp
      }]);
    }
  };
  
  const handleRemoveScenario = (nameToRemove: string) => {
    setSavedScenarios(prev => prev.filter(sc => sc.name !== nameToRemove));
  };
`;

code = code.replace(
  "useEffect(() => {",
  handleSaveStr + "\n  useEffect(() => {"
);

const chartSection = `{state.targets.includes('solar') && result?.dataSource?.monthlySunHours && result?.solar?.finalKwp && (
          <div className="col-span-1 lg:col-span-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 bg-white dark:bg-[#1a1b1e] p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
              <div className="flex-1">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Save size={18} className="text-blue-500" />
                  مقایسه سناریوها
                </h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  می‌توانید سناریوی فعلی را ذخیره کنید، سپس از طریق چت هوش مصنوعی تغییراتی اعمال کرده و نمودار تولید برق آنها را با هم مقایسه کنید.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleSaveScenario}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium"
                >
                  <Save size={16} />
                  ذخیره سناریوی فعلی
                </button>
              </div>
            </div>
            
            {savedScenarios.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {savedScenarios.map(sc => (
                  <div key={sc.name} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{sc.name}</span>
                    <button onClick={() => handleRemoveScenario(sc.name)} className="text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <MonthlyGenerationChart 
              monthlySunHours={result.dataSource.monthlySunHours} 
              systemKwp={result.solar.finalKwp} 
              compareScenarios={savedScenarios}
            />
          </div>
        )}`;

code = code.replace(
  /\{state\.targets\.includes\('solar'\) && result\?\.dataSource\?\.monthlySunHours && result\?\.solar\?\.finalKwp && \([\s\S]*?<MonthlyGenerationChart[\s\S]*?\/>\s*<\/div>\s*\)\}/,
  chartSection
);

fs.writeFileSync('src/pages/Result.tsx', code);
