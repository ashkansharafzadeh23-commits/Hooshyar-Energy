const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');

const newNotifs = `notifications: [
    {
      id: 'n1',
      title: 'وضعیت درخواست احداث نیروگاه',
      message: 'درخواست شما برای احداث نیروگاه خورشیدی مسکونی ثبت شد.',
      type: 'info',
      isRead: false,
      date: new Date().toISOString()
    },
    {
      id: 'n2',
      title: 'تایید سفارش خرید تجهیزات',
      message: 'سفارش خرید تجهیزات خورشیدی شما توسط فروشگاه تایید شد.',
      type: 'success',
      isRead: false,
      date: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'n3',
      title: 'تعمیرکار هوشمند اختصاص یافت',
      message: 'متخصص فنی جهت سرویس دوره‌ای تجهیزات شما تعیین گردید.',
      type: 'warning',
      isRead: false,
      date: new Date(Date.now() - 86400000).toISOString()
    }
  ],`;

content = content.replace(/notifications:\s*\[[\s\S]*?\],\s*\};/, newNotifs + '\n};');

fs.writeFileSync('src/context/AppContext.tsx', content);
