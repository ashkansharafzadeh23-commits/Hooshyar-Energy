const fs = require('fs');

function removeBackLink(file, regex) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(regex, '');
  fs.writeFileSync(file, content);
}

removeBackLink('src/pages/VendorsList.tsx', /<Link to="\/".*?>[\s\S]*?بازگشت به صفحه اصلی[\s\S]*?<\/Link>/g);
removeBackLink('src/pages/SmartMaintenance.tsx', /<button onClick=\{\(\) => navigate\(-1\)\}.*?>[\s\S]*?بازگشت به صفحه قبل[\s\S]*?<\/button>/g);
removeBackLink('src/pages/AdsPortal.tsx', /<button onClick=\{\(\) => navigate\(-1\)\}.*?>[\s\S]*?بازگشت به همکاران[\s\S]*?<\/button>/g);
removeBackLink('src/pages/SolarPlanner.tsx', /<Link to="\/checklist".*?>[\s\S]*?بازگشت به انتخاب لوازم[\s\S]*?<\/Link>/g);
removeBackLink('src/pages/PowerPlantSetup.tsx', /<Link to="\/".*?>[\s\S]*?بازگشت به صفحه اصلی[\s\S]*?<\/Link>/g);
removeBackLink('src/pages/TechniciansList.tsx', /<button onClick=\{\(\) => navigate\(-1\)\}.*?>[\s\S]*?بازگشت به همکاران[\s\S]*?<\/button>/g);
