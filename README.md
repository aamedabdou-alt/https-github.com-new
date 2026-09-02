# نظام إدارة مصنع الكولا (Cola Factory Management System)

تطبيق ويب لإدارة مصنع كولا: الإنتاج، المخزون، الطلبات، العملاء، الحسابات، المصروفات، الموظفين، والموردين — مع لوحة تحكم برسوم بيانية.

A full-featured factory management web app covering production, inventory, orders, clients, accounting, expenses, employees, and suppliers, with a chart-driven dashboard.

## التشغيل محليًا (Run locally)

```bash
npm install
npm run dev
```

ثم افتح الرابط الذي يظهر في الطرفية (عادة `http://localhost:5173`).

Then open the URL shown in the terminal (usually `http://localhost:5173`).

## البناء للإنتاج (Build for production)

```bash
npm run build
npm run preview
```

## البيانات (Data storage)

البيانات تُحفظ محليًا في متصفحك عبر `localStorage` (الملف `src/lib/storage.js`). لا يوجد اتصال بخادم خارجي؛ كل شيء يعمل من جهازك.

Data is persisted locally in the browser via `localStorage` (`src/lib/storage.js`). There's no external backend — everything runs on your machine. Swap that module out for a real API/database when you're ready to move beyond local-only storage.

## رفع المشروع على GitHub (Uploading to GitHub)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <رابط المستودع الخاص بك>
git push -u origin main
```

## البنية (Project structure)

```
cola-factory-app/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── src/
    ├── main.jsx        # نقطة الدخول (entry point)
    ├── App.jsx          # التطبيق الرئيسي (main application)
    └── lib/
        └── storage.js   # طبقة التخزين المحلي (local storage layer)
```

## التقنيات المستخدمة (Tech stack)

- React 18 + Vite
- [lucide-react](https://lucide.dev/) للأيقونات (icons)
- [recharts](https://recharts.org/) للرسوم البيانية (charts)
