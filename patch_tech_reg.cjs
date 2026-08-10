const fs = require('fs');
let code = fs.readFileSync('src/pages/TechnicianRegistration.tsx', 'utf-8');

if (!code.includes('fee')) {
  // Add fee to state
  code = code.replace(
    /phone: '',\s*bio: ''/,
    "phone: '',\n    fee: '',\n    bio: ''"
  );

  // Add fee to newTech object
  code = code.replace(
    /phone: formData.phone,\s*bio: formData.bio,/,
    "phone: formData.phone,\n      fee: formData.fee,\n      bio: formData.bio,"
  );

  // Add fee input to JSX
  const feeInput = `
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">هزینه پایه کارشناسی (تومان)</label>
                  <div className="relative">
                    <input required name="fee" value={formData.fee} onChange={handleChange} type="number" dir="ltr" className="w-full px-4 py-3.5 pl-10 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-medium text-gray-800 text-right" placeholder="مثال: 500000" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">تومان</span>
                  </div>
                </div>
  `;

  code = code.replace(
    /<div>\s*<label className="block text-sm font-bold text-gray-700 mb-2">شماره تماس<\/label>[\s\S]*?<\/div>\s*<\/div>/,
    `$&${feeInput}`
  );

  fs.writeFileSync('src/pages/TechnicianRegistration.tsx', code);
}
