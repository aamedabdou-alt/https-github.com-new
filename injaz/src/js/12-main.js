/* ========== الدخول والتشغيل ========== */
async function unlock(){
  let ok=true;
  try{ok=await cloudGate()}catch(e){ok=true}
  if(!ok)return;
  document.body.classList.remove('lock');const a=document.getElementById('auth');if(a)a.remove();
  if(!me()){await askName()}
  boot();CLOUD.mountUi();welcome();
}
function askName(){return new Promise(res=>{
  document.body.classList.add('lock');
  const el=document.createElement('div');el.id='auth';
  el.innerHTML='<div class="auth-in"><div class="auth-logo"></div><h1>'+APP_NAME+'</h1><p class="mut">اكتب اسمك لنبدأ.</p><label class="f">الاسم<input id="au-name" type="text" maxlength="40" autocomplete="name" placeholder="اسمك كما تحب أن يظهر"></label><div class="ar-msg bad" id="au-msg"></div><button class="btn big" id="au-go">ابدأ</button></div>';
  document.body.appendChild(el);
  const go=()=>{const n=(el.querySelector('#au-name').value||'').trim().replace(/\s+/g,' ');if(n.length<2){el.querySelector('#au-msg').textContent='اكتب اسمك (حرفان على الأقل).';return}
    const p=st.get('profile',{});p.name=n;st.set('profile',p);el.remove();document.body.classList.remove('lock');res()};
  el.querySelector('#au-go').onclick=go;el.querySelector('#au-name').onkeydown=e=>{if(e.key==='Enter')go()};
})}
function welcome(){const n=firstName();setTimeout(()=>toast(greeting()+(n?' يا '+n:'')+' 👋',3600),500)}
let booted=false;
function boot(){
  if(booted)return;booted=true;
  buildShell();
  loadBgImg().then(()=>applySkin());
  if(cfg.bg.ver!==2){if(cfg.bg.fixed!=='custom'){cfg.bg.mode='fixed';cfg.bg.fixed='night';cfg.bg.per={}}cfg.bg.ver=2;saveCfg()}
  const h=(location.hash||'').slice(1),tab=SEC.find(s=>s.id===h)?h:st.get('tab','home');
  go(tab);
  clock();setInterval(clock,20000);
  alarmInit();natInit();
  if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){navigator.serviceWorker.register('sw.js').catch(()=>{})}
}
addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(SEC.find(s=>s.id===h)&&h!==curSec)go(h)});
unlock();
