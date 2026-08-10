const fs = require('fs');
let code = fs.readFileSync('src/components/solar/BuildingModel.tsx', 'utf-8');

code = code.replace(/function getMetalRoofTexture\(\) \{/g, 'function getMetalRoofTexture(color: string = "#64748b") {');
code = code.replace(/if \(textureCache.has\('metal_roof'\)\) return textureCache.get\('metal_roof'\);/g, 'if (textureCache.has(\'metal_roof_\' + color)) return textureCache.get(\'metal_roof_\' + color);');
code = code.replace(/ctx\.fillStyle = '#64748b';/g, 'ctx.fillStyle = color;');
code = code.replace(/ctx\.fillStyle = '#475569';/g, 'ctx.fillStyle = "rgba(0,0,0,0.1)";');
code = code.replace(/textureCache\.set\('metal_roof', texture\);/g, 'textureCache.set(\'metal_roof_\' + color, texture);');

code = code.replace(/case 'house': default: return \{ width: 15, depth: 20, height: 6, color: '#d6d3d1' \};/g, "case 'house': default: return { width: 15, depth: 20, height: 6, color: '#F5F5DC' };");

code = code.replace(/const metalTexture = useMemo\(\(\) => \{/g, `const roofColor = buildingType === 'house' ? '#ffffff' : (buildingType === 'farm' ? '#7F1D1D' : '#64748b');
  const metalTexture = useMemo(() => {`);

code = code.replace(/const tex = getMetalRoofTexture\(\);/g, 'const tex = getMetalRoofTexture(roofColor);');
code = code.replace(/}, \[width, depth\]\);/g, '}, [width, depth, roofColor]);');

// Update roof meshes
code = code.replace(/color=\{metalTexture \? '#ffffff' : '\#374151'\}/g, "color={metalTexture ? '#ffffff' : roofColor}");
code = code.replace(/color=\{metalTexture \? '#ffffff' : \(buildingType === 'farm' \? '#7F1D1D' : '#4B5563'\)\}/g, "color={metalTexture ? '#ffffff' : roofColor}");

fs.writeFileSync('src/components/solar/BuildingModel.tsx', code);
