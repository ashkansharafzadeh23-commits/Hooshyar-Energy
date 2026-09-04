const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');

// Update import
content = content.replace(
  "import { UserFlowState, TargetModule, LocationType } from '../types';",
  "import { UserFlowState, TargetModule, LocationType, AppNotification } from '../types';"
);

// Add default initial notifications
const initialNotifications = `
  notifications: [
    {
      id: 'n1',
      title: 'خوش آمدید',
      message: 'به سیستم هوشمند مدیریت انرژی خوش آمدید.',
      type: 'info',
      isRead: false,
      date: new Date().toISOString()
    },
    {
      id: 'n2',
      title: 'تخفیف ویژه همکاران',
      message: 'ثبت‌نام همکاران جدید تا پایان ماه شامل ۲۰٪ تخفیف در پنل‌های خورشیدی است.',
      type: 'success',
      isRead: false,
      date: new Date(Date.now() - 86400000).toISOString()
    }
  ],
`;

content = content.replace(
  'actualMonthlyKwh: null,',
  `actualMonthlyKwh: null,\n${initialNotifications}`
);

// Add markNotificationAsRead and addNotification to AppContextType
const contextMethods = `
  markNotificationAsRead: (id: string) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'isRead'>) => void;
  markAllNotificationsAsRead: () => void;
`;

content = content.replace(
  'resetState: () => void;\n}',
  `resetState: () => void;\n${contextMethods}\n}`
);

// Add methods to AppProvider
const methodsImpl = `
  const markNotificationAsRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      )
    }));
  };

  const markAllNotificationsAsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, isRead: true }))
    }));
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'date' | 'isRead'>) => {
    setState(prev => ({
      ...prev,
      notifications: [
        {
          ...notif,
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString(),
          isRead: false
        },
        ...prev.notifications
      ]
    }));
  };

  const resetState = () => setState(initialState);
`;

content = content.replace(
  'const resetState = () => setState(initialState);',
  methodsImpl
);

content = content.replace(
  '<AppContext.Provider value={{ state, updateState, resetState }}>',
  '<AppContext.Provider value={{ state, updateState, resetState, markNotificationAsRead, addNotification, markAllNotificationsAsRead }}>'
);

fs.writeFileSync('src/context/AppContext.tsx', content);
