const fs = require('fs');
let code = fs.readFileSync('api/energy/analyze-images.js', 'utf8');

code = code.replace(
  /const \{ billImage, siteImage, manualConsumption, area \} = req\.body;/,
  "const { billImage, siteImages, manualConsumption, area } = req.body;"
);

code = code.replace(
  /if \(siteImage\) \{\s+contents\[0\]\.parts\.push\(\{\s+inlineData: \{\s+mimeType: siteImage\.mimeType \|\| 'image\/jpeg',\s+data: siteImage\.data,\s+\}\s+\}\);\s+\}/,
  `if (siteImages && Array.isArray(siteImages)) {
      siteImages.forEach(img => {
        contents[0].parts.push({
          inlineData: {
            mimeType: img.mimeType || 'image/jpeg',
            data: img.data,
          }
        });
      });
    }`
);

fs.writeFileSync('api/energy/analyze-images.js', code);
