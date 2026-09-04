const fs = require('fs');
let code = fs.readFileSync('src/components/MonthlyGenerationChart.tsx', 'utf8');

// I need to fix the template literal escaping which failed via cat << 'EOF'
// I will just replace `\${value} kWh` with `${value} kWh` because EOF didn't expand it if I used 'EOF', wait, if I used 'EOF' it SHOULD NOT expand, so it wrote \${value} which is invalid in typescript (backslash before $).
code = code.replace(/\\`\\?\\$\\{value\\} kWh\\`/, '`${value} kWh`');
code = code.replace(/\\`ماه \\?\\$\\{label\\}\\`/, '`ماه ${label}`');

// Let's just rewrite those two lines completely
code = code.replace(
  "formatter={(value: number) => [\\`\\${value} kWh\\`, 'تولید برق']}",
  "formatter={(value: number) => [`${value} kWh`, 'تولید برق']}"
);
code = code.replace(
  "labelFormatter={(label) => \\`ماه \\${label}\\`}",
  "labelFormatter={(label) => `ماه ${label}`}"
);

fs.writeFileSync('src/components/MonthlyGenerationChart.tsx', code);
