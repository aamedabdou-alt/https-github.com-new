-- إنجاز: مخطط قاعدة البيانات (Supabase / Postgres)
-- شغّله مرة واحدة من SQL Editor.
create table if not exists public.user_kv (
  user_id uuid not null references auth.users(id) on delete cascade,
  k text not null check (char_length(k) between 1 and 64),
  v jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, k)
);
alter table public.user_kv enable row level security;

create policy "own rows select" on public.user_kv for select using (auth.uid() = user_id);
create policy "own rows insert" on public.user_kv for insert with check (auth.uid() = user_id);
create policy "own rows update" on public.user_kv for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows delete" on public.user_kv for delete using (auth.uid() = user_id);

-- حدود الحماية: حجم القيمة وعدد المفاتيح لكل مستخدم
create or replace function public.user_kv_guard() returns trigger language plpgsql as $$
begin
  if octet_length(new.v::text) > 1000000 then raise exception 'value too large'; end if;
  if tg_op = 'INSERT' and (select count(*) from public.user_kv where user_id = new.user_id) >= 200 then
    raise exception 'too many keys';
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists user_kv_guard on public.user_kv;
create trigger user_kv_guard before insert or update on public.user_kv
  for each row execute function public.user_kv_guard();

-- حذف الحساب من داخل التطبيق (مطلوب في Google Play)
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- صلاحيات واجهة البيانات (ضرورية إن كان "Automatically expose new tables" معطلاً)
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.user_kv to authenticated;
