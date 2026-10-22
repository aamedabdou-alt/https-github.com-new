# اختبار اختراق قاعدة البيانات
يبني نسخة محلية من Postgres بنفس مخطط Supabase (`supabase_shim.sql` + `../supabase/schema.sql`) ثم ينفّذ آلاف الهجمات العشوائية بدور `anon` و`authenticated`:
قراءة وكتابة وحذف بيانات الآخرين، رفع ملكية صف، تصعيد صلاحيات، TRUNCATE، حقن نصوص، تضخيم التخزين، سرقة عبر استدعاء دوال، تزوير JWT.
التشغيل: `python3 pentest.py <seed> <عدد>` (يتطلب psycopg2 وخادم Postgres على المنفذ 5544).
