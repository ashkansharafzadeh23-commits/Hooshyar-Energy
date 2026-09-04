const fs = require('fs');
let content = fs.readFileSync('src/pages/Result.tsx', 'utf-8');

content = content.replace(
  "if (!response.ok) throw new Error('Analysis failed');",
  "if (!response.ok) {\n          const errorData = await response.json().catch(() => ({}));\n          throw new Error(errorData.error || 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');\n        }"
);

content = content.replace(
  "setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');",
  "setError(err instanceof Error ? err.message : 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');"
);

fs.writeFileSync('src/pages/Result.tsx', content);
