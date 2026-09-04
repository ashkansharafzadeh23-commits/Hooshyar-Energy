const fs = require('fs');
let code = fs.readFileSync('src/components/MonthlyGenerationChart.tsx', 'utf8');

code = code.replace(
  'import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from \'recharts\';',
  'import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from \'recharts\';'
);

code = code.replace(
  'interface Props {\n  monthlySunHours?: Record<string, number>;\n  systemKwp?: number;\n}',
  `interface Scenario {
  name: string;
  monthlySunHours?: Record<string, number>;
  systemKwp?: number;
}

interface Props {
  monthlySunHours?: Record<string, number>;
  systemKwp?: number;
  compareScenarios?: Scenario[];
}`
);

code = code.replace(
  'export default function MonthlyGenerationChart({ monthlySunHours, systemKwp }: Props) {\n  if (!monthlySunHours || !systemKwp) return null;',
  `export default function MonthlyGenerationChart({ monthlySunHours, systemKwp, compareScenarios = [] }: Props) {\n  if (!monthlySunHours || !systemKwp) return null;`
);

code = code.replace(
  'const data = new Array(12).fill({ name: \'\', generation: 0 });',
  'const data = new Array(12).fill(null).map(() => ({ name: \'\', Current: 0 }));'
);

code = code.replace(
  /Object\.entries\(mapGregorianToJalali\)\.forEach\(\(\[gregorian, jalali\]\) => \{[\s\S]*?\}\);/,
  `Object.entries(mapGregorianToJalali).forEach(([gregorian, jalali]) => {
    const sunHours = monthlySunHours[gregorian] || 0;
    const days = daysInMonth[jalali.index];
    const monthlyGen = systemKwp * sunHours * PERFORMANCE_RATIO * days;
    const item: any = {
      name: jalali.name,
      'سناریوی فعلی': Math.round(monthlyGen)
    };
    
    compareScenarios.forEach(sc => {
      if (sc.monthlySunHours && sc.systemKwp) {
        const scSunHours = sc.monthlySunHours[gregorian] || 0;
        item[sc.name] = Math.round(sc.systemKwp * scSunHours * PERFORMANCE_RATIO * days);
      }
    });

    data[jalali.index] = item;
  });`
);

code = code.replace(
  'const averageGen = Math.round(data.reduce((acc, curr) => acc + curr.generation, 0) / 12);',
  'const averageGen = Math.round(data.reduce((acc, curr) => acc + curr["سناریوی فعلی"], 0) / 12);'
);

code = code.replace(
  'formatter={(value: number) => [`${value} kWh`, \'تولید برق\']}',
  'formatter={(value: number, name: string) => [`${value} kWh`, name]}'
);

code = code.replace(
  '<Bar \n              dataKey="generation" \n              fill="#3b82f6" \n              radius={[4, 4, 0, 0]} \n            />',
  `<Bar dataKey="سناریوی فعلی" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            {compareScenarios.map((sc, i) => {
              const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
              return (
                <Bar key={sc.name} dataKey={sc.name} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
              );
            })}
            {compareScenarios.length > 0 && <Legend wrapperStyle={{ fontFamily: 'Vazirmatn, sans-serif', fontSize: '12px' }} />}
`
);

fs.writeFileSync('src/components/MonthlyGenerationChart.tsx', code);
