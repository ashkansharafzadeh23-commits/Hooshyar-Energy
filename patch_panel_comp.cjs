const fs = require('fs');
let code = fs.readFileSync('src/components/PanelComparison.tsx', 'utf-8');

code = code.replace(/import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';/, 
"import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';");

code = code.replace(/<cell/g, '<Cell');
code = code.replace(/<\/cell>/g, '<\/Cell>');

fs.writeFileSync('src/components/PanelComparison.tsx', code);
