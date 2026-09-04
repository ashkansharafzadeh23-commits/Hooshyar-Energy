const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');

const updatedNotifications = `notifications: [
    {
      id: 'n1',
      title: 'وضعیت درخواست احداث نیروگاه',
      message: 'درخواست شما برای احداث نیروگاه خورشیدی مسکونی در سامانه ثبت شد و در حال بررسی است.',
      type: 'info',
      isRead: false,
      date: new Date().toISOString()
    },
    {
      id: 'n2',
      title: 'تایید سفارش خرید',
      message: 'سفارش خرید تجهیزات خورشیدی شما توسط فروشنده تایید شد و در مرحله ارسال است.',
      type: 'success',
      isRead: false,
      date: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'n3',
      title: 'درخواست تعمیرکار هوشمند',
      message: 'تعمیرکار مجاز برای بررسی دوره‌ای پنل‌های شما هماهنگ شد. منتظر تماس باشید.',
      type: 'warning',
      isRead: false,
      date: new Date(Date.now() - 86400000).toISOString()
    }
  ],`;

content = content.replace(/notifications:\s*\[[\s\S]*?\],\s*}/, updatedNotifications + '\n};');
// Wait, the previous replacement might be hard because of how the structure is. Let's do it carefully by regex or substring.

