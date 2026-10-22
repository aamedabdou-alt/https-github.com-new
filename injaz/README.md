# إنجاز
تطبيق مذاكرة ومهام: يعمل بلا إنترنت، وحسابات اختيارية بمزامنة سحابية، ومنبّهات نظام على أندرويد.

## الهيكل
- `src/` الشيفرة (JS/CSS/HTML) وتُبنى بـ `python3 build.py` إلى `dist/index.html`.
- `src/config.js` ضع فيه `supabaseUrl` و `supabaseAnonKey` (المفتاح العام فقط).
- `supabase/schema.sql` قاعدة البيانات (جدول `user_kv` + RLS + حذف الحساب).
- `mobile/` مشروع Capacitor للأندرويد. يبنيه `.github/workflows/android.yml` ويخرج APK.
- `legal/` سياسة الخصوصية وصفحة حذف الحساب (مطلوبتان في Google Play).

## الإعداد
1. أنشئ مشروع Supabase، وعطّل Confirm email من Authentication ← Providers ← Email.
2. شغّل `supabase/schema.sql` في SQL Editor.
3. ضع الرابط والمفتاح العام في `src/config.js`، ثم `python3 build.py`، وانسخ الناتج إلى `injaz/dist/`.
4. ارفع للمستودع وشغّل Actions ← Build Android APK، ونزّل الملف من Artifacts.
