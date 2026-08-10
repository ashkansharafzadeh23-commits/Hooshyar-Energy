const fs = require('fs');
let code = fs.readFileSync('src/pages/PowerPlantSetup.tsx', 'utf-8');

const importsToAdd = `import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';`;
code = code.replace(/import Markdown from 'react-markdown';/, `import Markdown from 'react-markdown';\n${importsToAdd}`);

const stateToAdd = `  const [financialData, setFinancialData] = useState<any[]>([]);`;
code = code.replace(/const \[result, setResult\] = useState<string \| null>\(null\);/, `const [result, setResult] = useState<string | null>(null);\n${stateToAdd}`);

const handleSubmitUpdate = `      const data = await response.json();
      setResult(data.analysis);
      setFinancialData(data.financialData || []);`;
code = code.replace(/const data = await response\.json\(\);\n\s*setResult\(data\.analysis\);/, handleSubmitUpdate);

const chartsToAdd = `
        {financialData && financialData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E4E7EC] mt-6">
            <h2 className="text-xl font-black text-gray-800 mb-6 border-b border-gray-100 pb-4">پیش‌بینی مالی ۱۰ ساله (ارقام به میلیون تومان)</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="h-80 w-full">
                <h3 className="text-sm font-bold text-gray-600 mb-4 text-center">روند بازگشت سرمایه و سود تجمعی</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <RechartsTooltip formatter={(value) => [\`\${value} میلیون تومان\`, 'سود تجمعی']} />
                    <Area type="monotone" dataKey="cumulativeProfit" stroke="#10b981" fill="#d1fae5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-80 w-full">
                <h3 className="text-sm font-bold text-gray-600 mb-4 text-center">مقایسه درآمد و هزینه نگهداری سالیانه</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <RechartsTooltip formatter={(value, name) => [\`\${value} میلیون تومان\`, name === 'revenue' ? 'درآمد' : 'هزینه نگهداری']} />
                    <Legend />
                    <Bar dataKey="revenue" name="درآمد" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="maintenance" name="هزینه نگهداری" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 rounded-tr-xl">سال</th>
                    <th className="px-4 py-3">درآمد ناخالص</th>
                    <th className="px-4 py-3">هزینه نگهداری</th>
                    <th className="px-4 py-3">سود خالص</th>
                    <th className="px-4 py-3 rounded-tl-xl">سود تجمعی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {financialData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-800">{row.year}</td>
                      <td className="px-4 py-3 text-emerald-600">{row.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-red-500">{row.maintenance.toLocaleString()}</td>
                      <td className="px-4 py-3 text-blue-600 font-bold">{row.netProfit.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-800 font-black" dir="ltr">{row.cumulativeProfit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
`;

code = code.replace(/<\/main>/, `${chartsToAdd}\n      </main>`);

fs.writeFileSync('src/pages/PowerPlantSetup.tsx', code);
