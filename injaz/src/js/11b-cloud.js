/* ========== الحسابات والمزامنة السحابية (اختيارية) ==========
   - تسجيل باسم + اسم مستخدم + كلمة مرور فقط.
   - البيانات تُحفظ محلياً أولاً (تعمل بلا إنترنت) ثم تُرفع إلى جدول user_kv.
   - كل مستخدم يرى صفوفه فقط (RLS في قاعدة البيانات). */
const CLOUD={on:false,client:null,user:null,q:{},timer:null,busy:false,last:0,err:'',off:false};
const LOCAL_ONLY=['tab','snooze','wrem'];
const lsk=k=>'ab:'+k;
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};
const dataKeys=()=>{const o=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('ab:')&&!k.startsWith('ab:__'))o.push(k.slice(3))}}catch(e){}return o};
function clearLocal(){const ks=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('ab:'))ks.push(k)}}catch(e){}ks.forEach(lsDel)}
CLOUD.init=function(){
  const c=window.INJAZ||{};
  if(!c.supabaseUrl||!c.supabaseAnonKey||!window.supabase)return false;
  try{CLOUD.client=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'injaz-auth'}});CLOUD.on=true;return true}catch(e){return false}
};
CLOUD.email=u=>u+'@'+((window.INJAZ&&window.INJAZ.emailDomain)||'injaz.app');
CLOUD.msg=e=>{
  const m=String((e&&e.message)||e||'').toLowerCase();
  if(m.includes('invalid login'))return 'اسم المستخدم أو كلمة المرور غير صحيحة.';
  if(m.includes('already registered')||m.includes('already been registered'))return 'اسم المستخدم مأخوذ. اختر اسماً آخر.';
  if(m.includes('rate limit')||m.includes('too many'))return 'محاولات كثيرة. انتظر دقائق ثم أعد المحاولة.';
  if(m.includes('password'))return 'كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل.';
  if(m.includes('failed to fetch')||m.includes('network')||!navigator.onLine)return 'تعذر الاتصال بالإنترنت.';
  if(m.includes('email')&&m.includes('confirm'))return 'الخادم يطلب تأكيد البريد. عطّل Confirm email في إعدادات Supabase.';
  return 'تعذر إكمال العملية. أعد المحاولة.';
};
/* ----- الرفع ----- */
cloudTouch=function(k){
  if(!CLOUD.on||!CLOUD.user||LOCAL_ONLY.includes(k)||k.startsWith('__'))return;
  CLOUD.q[k]=1;lsSet('ab:__q',JSON.stringify(CLOUD.q));
  clearTimeout(CLOUD.timer);CLOUD.timer=setTimeout(CLOUD.flush,2500);CLOUD.paint();
};
CLOUD.flush=async function(){
  if(!CLOUD.on||!CLOUD.user||CLOUD.busy)return true;
  const ks=Object.keys(CLOUD.q);if(!ks.length)return true;
  if(!navigator.onLine){CLOUD.off=true;CLOUD.paint();return false}
  CLOUD.busy=true;
  try{
    const rows=[];ks.forEach(k=>{const raw=lsGet(lsk(k));if(raw==null)return;try{rows.push({user_id:CLOUD.user.id,k:k,v:JSON.parse(raw)})}catch(e){}});
    if(rows.length){const r=await CLOUD.client.from('user_kv').upsert(rows,{onConflict:'user_id,k'});if(r.error)throw r.error}
    ks.forEach(k=>delete CLOUD.q[k]);lsSet('ab:__q',JSON.stringify(CLOUD.q));CLOUD.last=Date.now();CLOUD.err='';CLOUD.off=false;
  }catch(e){CLOUD.err=CLOUD.msg(e);clearTimeout(CLOUD.timer);CLOUD.timer=setTimeout(CLOUD.flush,30000)}
  CLOUD.busy=false;CLOUD.paint();return !CLOUD.err;
};
/* ----- السحب ----- */
CLOUD.fetchAll=async function(){const r=await CLOUD.client.from('user_kv').select('k,v,updated_at');if(r.error)throw r.error;return r.data||[]};
CLOUD.pull=async function(){
  if(!CLOUD.on||!CLOUD.user||!navigator.onLine)return;
  try{
    const rows=await CLOUD.fetchAll();let changed=0;
    rows.forEach(r=>{
      if(CLOUD.q[r.k]||LOCAL_ONLY.includes(r.k))return;
      const s=JSON.stringify(r.v);if(lsGet(lsk(r.k))===s)return;
      lsSet(lsk(r.k),s);changed++;
      if(r.k==='cfg'&&typeof cfg!=='undefined'){const n=merge(JSON.parse(JSON.stringify(DEF)),r.v);Object.keys(cfg).forEach(x=>delete cfg[x]);Object.assign(cfg,n)}
    });
    CLOUD.last=Date.now();CLOUD.off=false;
    if(changed&&typeof renderSec==='function'){try{applySkin();renderSec(curSec)}catch(e){}}
  }catch(e){CLOUD.err=CLOUD.msg(e)}
  CLOUD.paint();
};
/* حالة المزامنة في الواجهة */
CLOUD.paint=function(){
  const b=document.querySelector('[data-a=account]');if(!b)return;
  const n=Object.keys(CLOUD.q).length;
  b.classList.toggle('pend',n>0||!!CLOUD.err||CLOUD.off);
  b.title=CLOUD.err||(CLOUD.off?'غير متصل':(n?'جارٍ الحفظ…':'محفوظ في حسابك'));
};
/* ----- ربط الجهاز بالمستخدم ----- */
CLOUD.adopt=async function(user){
  CLOUD.user=user;
  const prev=lsGet('ab:__uid');
  if(prev===user.id){try{CLOUD.q=JSON.parse(lsGet('ab:__q')||'{}')}catch(e){CLOUD.q={}}return 'ok'}
  let remote=[];
  try{remote=await CLOUD.fetchAll()}catch(e){throw e}
  if(remote.length){
    clearLocal();remote.forEach(r=>lsSet(lsk(r.k),JSON.stringify(r.v)));lsSet('ab:__uid',user.id);return 'reload';
  }
  if(!prev&&dataKeys().length){
    /* بيانات محلية قديمة قبل وجود الحسابات: انقلها إلى الحساب */
    lsSet('ab:__uid',user.id);dataKeys().forEach(k=>{if(!LOCAL_ONLY.includes(k))CLOUD.q[k]=1});lsSet('ab:__q',JSON.stringify(CLOUD.q));return 'ok';
  }
  if(prev&&prev!==user.id){clearLocal();lsSet('ab:__uid',user.id);return 'reload'}
  lsSet('ab:__uid',user.id);return 'ok';
};
CLOUD.begin=async function(user){
  const r=await CLOUD.adopt(user);
  if(r==='reload'){location.reload();return new Promise(()=>{})}
  CLOUD.start();return true;
};
CLOUD.start=function(){
  addEventListener('online',()=>{CLOUD.off=false;CLOUD.flush().then(CLOUD.pull)});
  addEventListener('offline',()=>{CLOUD.off=true;CLOUD.paint()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)CLOUD.flush();else CLOUD.flush().then(CLOUD.pull)});
  setInterval(()=>{if(!document.hidden){CLOUD.flush().then(CLOUD.pull)}},60000);
  CLOUD.flush();
};
/* ----- شاشة الدخول ----- */
function authMarkup(mode){
  const su=mode==='up';
  return '<div class="auth-in"><div class="auth-logo"></div><h1>'+APP_NAME+'</h1><p class="mut">'+(su?'أنشئ حسابك ليحتفظ التطبيق ببياناتك.':'سجّل دخولك لمتابعة يومك.')+'</p>'+
  '<div class="chips auth-tabs"><button class="chip'+(su?'':' on')+'" data-a="authmode" data-m="in">دخول</button><button class="chip'+(su?' on':'')+'" data-a="authmode" data-m="up">حساب جديد</button></div>'+
  (su?'<label class="f">الاسم<input id="au-name" type="text" maxlength="40" autocomplete="name" placeholder="اسمك كما تحب أن يظهر"></label>':'')+
  '<label class="f">اسم المستخدم<input id="au-user" type="text" dir="ltr" maxlength="24" autocapitalize="none" autocomplete="username" placeholder="مثال: ahmed.2008" style="text-align:left"></label>'+
  '<label class="f">كلمة المرور<input id="au-pass" type="password" dir="ltr" maxlength="72" autocomplete="'+(su?'new-password':'current-password')+'" placeholder="8 أحرف على الأقل" style="text-align:left"></label>'+
  (su?'<label class="f">تأكيد كلمة المرور<input id="au-pass2" type="password" dir="ltr" maxlength="72" autocomplete="new-password" style="text-align:left"></label><p class="mut sm" style="margin:0">لا توجد وسيلة لاستعادة كلمة المرور، فاحتفظ بها في مكان آمن.</p>':'')+
  '<div class="ar-msg bad" id="au-msg" role="alert"></div>'+
  '<button class="btn big" id="au-go" data-a="authgo" data-m="'+(su?'up':'in')+'">'+(su?'إنشاء الحساب':'دخول')+'</button>'+
  ((window.INJAZ&&window.INJAZ.privacyUrl)?'<p class="mut sm" style="margin:10px 0 0">بالمتابعة توافق على <a href="'+window.INJAZ.privacyUrl+'" target="_blank" rel="noopener">سياسة الخصوصية</a>.</p>':'')+'</div>';
}
let authDone=null;
function showAuth(done){
  authDone=done;document.body.classList.add('lock');
  let el=document.getElementById('auth');if(!el){el=document.createElement('div');el.id='auth';document.body.appendChild(el)}
  el.innerHTML=authMarkup('in');
}
const authMsg=t=>{const m=document.getElementById('au-msg');if(m)m.textContent=t||''};
ACT.authmode=t=>{const el=document.getElementById('auth');if(el)el.innerHTML=authMarkup(t.dataset.m)};
ACT.authgo=async t=>{
  const up=t.dataset.m==='up',u=(document.getElementById('au-user').value||'').trim().toLowerCase(),p=document.getElementById('au-pass').value||'';
  const name=up?(document.getElementById('au-name').value||'').trim().replace(/\s+/g,' '):'';
  if(up&&name.length<2)return authMsg('اكتب اسمك (حرفان على الأقل).');
  if(!/^[a-z0-9._]{3,24}$/.test(u))return authMsg('اسم المستخدم: 3 إلى 24 حرفاً إنجليزياً صغيراً أو أرقاماً أو . أو _');
  if(p.length<8)return authMsg('كلمة المرور 8 أحرف على الأقل.');
  if(up&&p!==document.getElementById('au-pass2').value)return authMsg('كلمتا المرور غير متطابقتين.');
  if(!navigator.onLine)return authMsg('تحتاج اتصالاً بالإنترنت لتسجيل الدخول أو إنشاء الحساب.');
  t.disabled=true;authMsg('');
  try{
    let r;
    if(up){r=await CLOUD.client.auth.signUp({email:CLOUD.email(u),password:p,options:{data:{username:u,name:name}}});if(r.error)throw r.error;if(!r.data.session)throw new Error('email confirm')}
    else{r=await CLOUD.client.auth.signInWithPassword({email:CLOUD.email(u),password:p});if(r.error)throw r.error}
    const user=r.data.user;
    if(up){const keep=lsGet('ab:__uid');if(keep&&keep!==user.id){clearLocal()}CLOUD.user=user;lsSet('ab:profile',JSON.stringify({name:name,username:u}));lsSet('ab:__uid',user.id);CLOUD.q={profile:1};lsSet('ab:__q',JSON.stringify(CLOUD.q));if(dataKeys().length>1){dataKeys().forEach(k=>{if(!LOCAL_ONLY.includes(k))CLOUD.q[k]=1});lsSet('ab:__q',JSON.stringify(CLOUD.q))}CLOUD.start();location.reload();return}
    const res=await CLOUD.begin(user);
    if(res===true){const el=document.getElementById('auth');if(el)el.remove();authDone&&authDone(true)}
  }catch(e){t.disabled=false;authMsg(CLOUD.msg(e))}
};
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.getElementById('auth')){const b=document.getElementById('au-go');if(b&&!b.disabled)b.click()}});
async function cloudGate(){
  if(!CLOUD.init())return true;
  let ses=null;
  try{const r=await CLOUD.client.auth.getSession();ses=r.data&&r.data.session}catch(e){}
  if(ses){
    try{return await CLOUD.begin(ses.user)}catch(e){
      if(lsGet('ab:__uid')===ses.user.id){CLOUD.user=ses.user;CLOUD.off=true;try{CLOUD.q=JSON.parse(lsGet('ab:__q')||'{}')}catch(x){CLOUD.q={}}CLOUD.start();return true}
      throw e}
  }
  const uid=lsGet('ab:__uid');
  if(!navigator.onLine&&uid){CLOUD.user={id:uid};CLOUD.off=true;try{CLOUD.q=JSON.parse(lsGet('ab:__q')||'{}')}catch(e){CLOUD.q={}}CLOUD.start();return true}
  return new Promise(res=>showAuth(res));
}
/* ----- الحساب ----- */
ACT.account=()=>{
  const p=st.get('profile',{}),n=Object.keys(CLOUD.q).length;
  sheet('<h3>حسابي</h3><div class="card" style="margin:8px 0"><div class="b">'+esc(p.name||'')+'</div><div class="mut sm" dir="ltr" style="text-align:right">@'+esc(p.username||'')+'</div></div>'+
   '<p class="mut sm">'+(CLOUD.err?esc(CLOUD.err):CLOUD.off?'أنت غير متصل. بياناتك محفوظة على هاتفك وسترفع عند عودة الإنترنت.':n?'جارٍ حفظ '+n+' عنصر في حسابك…':'كل بياناتك محفوظة في حسابك.')+'</p>'+
   '<div class="row" style="margin-top:10px"><button class="btn g" data-a="syncnow">مزامنة الآن</button><button class="btn g" data-a="logout">تسجيل الخروج</button></div>'+
   '<div class="row" style="margin-top:18px;border-top:1px solid var(--line);padding-top:14px"><button class="btn d" data-a="delacct">حذف حسابي وبياناتي نهائياً</button></div><p class="mut sm">الحذف يمسح حسابك وكل بياناتك من الخادم ولا يمكن التراجع عنه.</p>');
};
ACT.syncnow=async()=>{toast('جارٍ المزامنة…');const ok=await CLOUD.flush();await CLOUD.pull();toast(ok?'تمت المزامنة':'تعذرت المزامنة، سنعيد المحاولة')};
ACT.logout=()=>ask('سيُسجَّل خروجك وتُزال بياناتك من هذا الجهاز (تبقى في حسابك). متابعة؟','تسجيل الخروج',async()=>{
  toast('جارٍ الحفظ…');const ok=await CLOUD.flush();
  if(!ok&&navigator.onLine&&Object.keys(CLOUD.q).length){toast('تعذر حفظ بعض البيانات. حاول لاحقاً.');return}
  try{await CLOUD.client.auth.signOut()}catch(e){}clearLocal();try{indexedDB.deleteDatabase('ab-bg')}catch(e){}location.reload();
});
ACT.delacct=()=>ask('سيُحذف حسابك وكل بياناتك نهائياً من الخادم ومن هذا الجهاز. لا رجوع بعد ذلك.','حذف نهائي',async()=>{
  try{const r=await CLOUD.client.rpc('delete_my_account');if(r.error)throw r.error}catch(e){toast(CLOUD.msg(e));return}
  try{await CLOUD.client.auth.signOut()}catch(e){}clearLocal();try{indexedDB.deleteDatabase('ab-bg');indexedDB.deleteDatabase('ab-lib')}catch(e){}location.reload();
},true);
CLOUD.mountUi=function(){
  const t=document.querySelector('.tact');if(!t||t.querySelector('[data-a=account]'))return;
  const b=document.createElement('button');b.className='ib';b.dataset.a='account';b.setAttribute('aria-label','حسابي');
  b.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.9-3.6 3.8-5.4 7.5-5.4s6.6 1.8 7.5 5.4"/></svg>';t.insertBefore(b,t.firstChild);CLOUD.paint();
};
