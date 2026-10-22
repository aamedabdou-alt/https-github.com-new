'use strict';
/* ========== أدوات أساسية ========== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches,G=window.gsap,A=!!G&&!RM;
const APP_NAME='إنجاز';
let cloudTouch=null;
const st={
  get(k,d){try{const v=localStorage.getItem('ab:'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('ab:'+k,JSON.stringify(v));if(cloudTouch)cloudTouch(k);return true}catch(e){toast('تعذر الحفظ. ربما امتلأت مساحة التخزين.');return false}}
};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const dk=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const td=()=>dk(new Date());
const dOf=k=>new Date(k+'T12:00:00');
const addDays=(k,n)=>{const d=dOf(k);d.setDate(d.getDate()+n);return dk(d)};
const wdOf=k=>dOf(k).getDay();
const DN=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const WORD=[6,0,1,2,3,4,5];
const pm=s=>{const p=String(s||'0:0').split(':');return (parseInt(p[0],10)||0)*60+(parseInt(p[1],10)||0)};
const hm=n=>{n=((Math.round(n)%1440)+1440)%1440;return pad(Math.floor(n/60))+':'+pad(n%60)};
const t12=n=>{n=((Math.round(n)%1440)+1440)%1440;const h=Math.floor(n/60),m=n%60;return (h%12||12)+':'+pad(m)+' '+(h<12?'ص':'م')};
const dur=n=>{n=Math.round(n);const h=Math.floor(n/60),m=n%60;return h?(m?`${h} س و ${m} د`:`${h} س`):`${m} د`};
const nowMin=()=>{const n=new Date();return n.getHours()*60+n.getMinutes()+n.getSeconds()/60};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const num=(v,d)=>{v=parseFloat(v);return isFinite(v)?v:(d||0)};
const sum=a=>a.reduce((x,y)=>x+y,0);
const ymd=k=>dOf(k).toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
const ago=n=>{const a=[];for(let i=n-1;i>=0;i--)a.push(addDays(td(),-i));return a};

function toast(msg,ms){
  const t=$('#toast');if(!t)return;const e=document.createElement('div');e.className='tt';e.textContent=msg;t.appendChild(e);
  if(A)G.fromTo(e,{y:20,opacity:0},{y:0,opacity:1,duration:.3});setTimeout(()=>e.remove(),ms||2800)
}
function sheet(html,onMount){
  const m=$('#modal');m.innerHTML='<div class="sheet card" role="dialog" aria-modal="true"><button class="x cl" aria-label="إغلاق" data-close>×</button>'+html+'</div>';
  m.hidden=false;document.body.classList.add('mo');
  m.onmousedown=e=>{if(e.target===m)closeSheet()};m.onclick=e=>{if(e.target.closest('[data-close]'))closeSheet()};
  if(onMount)onMount(m.firstChild);if(A)G.from(m.firstChild,{y:30,opacity:0,duration:.35})
}
function closeSheet(){const m=$('#modal');m.hidden=true;m.innerHTML='';document.body.classList.remove('mo')}
function ask(msg,yes,cb,danger){
  sheet(`<h3>تأكيد</h3><p>${msg}</p><div class="row" style="margin-top:12px"><button class="btn ${danger?'d':''}" id="askY">${yes}</button><button class="btn g" data-close>إلغاء</button></div>`,s=>{$('#askY',s).onclick=()=>{closeSheet();cb()}})
}

/* ========== الإعدادات ========== */
const DEF={
  studyStart:'05:00',studyEnd:'08:30',focus:50,brk:10,win:{},
  plan:{},
  school:{on:false,from:'08:00',to:'14:00',days:[6,0,1,2,3,4]},
  arabic:{name:'الدرس الأول',time:'15:00',dur:90,days:[]},
  prog:{name:'الدرس الثاني (خارج البيت)',time:'19:00',dur:120,days:[],trav:30},
  eng:{name:'حصة أونلاين',on:true,time:'16:00',dur:60,days:[]},
  gymDays:[6,0,1,3,4],gym:{dur:70,opt:{},t:{a:'',b:''}},
  split:{6:'صدر + ترايسبس',0:'ظهر + باي',1:'أرجل',3:'أكتاف + بطن',4:'كارديو ولياقة',2:'راحة',5:'راحة'},
  dinner:'19:15',
  read:{target:75,pos:'morning'},
  kcal:1500,sugar:25,protein:80,
  water:{goal:2500,cup:250},
  caf:{limit:100,sugar:0},
  sleep:{target:480,bed:'21:30'},
  loc:{name:'القاهرة',lat:30.04,lng:31.24},
  notify:false,remWater:false,
  alarm:{on:true,mode:'auto',lead:10,fixed:'03:20',days:[0,1,2,3,4,5,6],sound:'siren',vol:90,vib:true,rug:[],sens:'mid',skip:'',log:{}},
  subs:[],
  theme:{},
  bg:{mode:'fixed',fixed:'night',per:{},ver:2,dim:.38,custom:{kind:'',color:'#101820'}}
};
function merge(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))merge(a[k],b[k]);else a[k]=b[k]}return a}
let cfg=merge(JSON.parse(JSON.stringify(DEF)),st.get('cfg',{}));
const saveCfg=()=>st.set('cfg',cfg);

/* ========== المواد ========== */
const BASE_SUB=[{k:'ar',n:'اللغة العربية',e:'Arabic',c:'#c8a27a'},{k:'en',n:'اللغة الإنجليزية',e:'English',c:'#8fb3ff'},{k:'math',n:'الرياضيات',e:'Math',c:'#7fb29a'},{k:'sci',n:'العلوم',e:'Science',c:'#7fbfae'},{k:'hist',n:'التاريخ',e:'History',c:'#d98c5f'}];
const subs=()=>{const m=(typeof mySubs==='function')?mySubs():[];return (m.length?m:BASE_SUB).concat(cfg.subs||[])};
const sub=k=>subs().find(s=>s.k===k)||{k:k,n:k==='rev'?'مراجعة':k==='read'?'القراءة':String(k),c:k==='rev'?'#b8a5ff':k==='read'?'#e8a1c9':'#a7b5b1'};
const PLAN0={6:['ar','math','en','sci'],0:['en','sci','math','ar'],1:['math','ar','hist','en'],2:['hist','en','ar','math'],3:['ar','sci','en','math'],4:['en','hist','sci','rev'],5:['hist','rev','math','en']};
const planOf=w=>(cfg.plan[w]&&cfg.plan[w].length?cfg.plan[w]:((typeof genPlan==='function'&&mySubs().length)?genPlan(w):PLAN0[w]));
const winOf=w=>cfg.win[w]||[cfg.studyStart,cfg.studyEnd];
const LD=()=>cfg.arabic.days.concat(cfg.prog.days);
const isLessonDay=w=>cfg.arabic.days.includes(w)||cfg.prog.days.includes(w);

/* ========== أوقات الصلاة (حساب فلكي تقريبي، الطريقة المصرية) ========== */
const PRC={};
function prayers(k){
  k=k||td();const key=k+'|'+cfg.loc.lat+'|'+cfg.loc.lng;if(PRC[key])return PRC[key];
  const lat=cfg.loc.lat,lng=cfg.loc.lng,d=dOf(k),R=Math.PI/180;
  const sin=x=>Math.sin(x*R),cos=x=>Math.cos(x*R),tan=x=>Math.tan(x*R),asin=x=>Math.asin(x)/R,acos=x=>Math.acos(x)/R,atan2=(y,x)=>Math.atan2(y,x)/R,acot=x=>Math.atan(1/x)/R;
  const fixA=a=>{a=a-360*Math.floor(a/360);return a},fixH=a=>{a=a-24*Math.floor(a/24);return a};
  const tz=-d.getTimezoneOffset()/60;
  let Y=d.getFullYear(),M=d.getMonth()+1;const Dd=d.getDate();if(M<=2){Y-=1;M+=12}
  const A1=Math.floor(Y/100),B1=2-A1+Math.floor(A1/4);
  const jd=Math.floor(365.25*(Y+4716))+Math.floor(30.6001*(M+1))+Dd+B1-1524.5-lng/360;
  const D2=jd+0.5-2451545.0,g=fixA(357.529+0.98560028*D2),q=fixA(280.459+0.98564736*D2),L=fixA(q+1.915*sin(g)+0.020*sin(2*g)),e=23.439-0.00000036*D2;
  const RA=atan2(cos(e)*sin(L),cos(L))/15,eqt=q/15-fixH(RA),decl=asin(sin(e)*sin(L));
  const noon=fixH(12-eqt);
  const ang=a=>(1/15)*acos((-sin(a)-sin(decl)*sin(lat))/(cos(decl)*cos(lat)));
  const adj=h=>Math.round((h+tz-lng/15)*60);
  const asrA=-acot(1+tan(Math.abs(lat-decl)));
  const r={fajr:adj(noon-ang(19.5)),sunrise:adj(noon-ang(0.833)),dhuhr:adj(noon)+1,asr:adj(noon+ang(asrA)),maghrib:adj(noon+ang(0.833))+1,isha:adj(noon+ang(17.5))};
  PRC[key]=r;return r;
}

/* ========== قواعد البيانات اليومية ========== */
const D={
  smin:k=>st.get('smin',{})[k]||{},
  addSmin(k,s,m){const a=st.get('smin',{});a[k]=a[k]||{};a[k][s]=(a[k][s]||0)+m;st.set('smin',a)},
  study:k=>sum(Object.values(D.smin(k))),
  rlog:k=>(st.get('rlog',{})[k]||[]),
  read:k=>sum(D.rlog(k).map(x=>x.min||0)),
  water:k=>(st.get('water',{})[k]||0),
  caf:k=>Object.assign({cof:0,tea:0,sug:0,last:''},(st.get('caf',{})[k]||{})),
  food:k=>(st.get('food',{})[k]||[]),
  gym:k=>(st.get('gym',{})[k]||null),
  sleep:k=>(st.get('sleep',{})[k]||null),
  tdone:k=>(st.get('tdone',{})[k]||0)
};
function foodTotals(k){
  const f=D.food(k),c=D.caf(k);
  const kc=sum(f.map(x=>x.k||0))+c.sug*16,p=sum(f.map(x=>x.p||0)),s=sum(f.map(x=>x.s||0))+c.sug*4;
  return{kcal:Math.round(kc),protein:Math.round(p),sugar:Math.round(s*10)/10,drinkKcal:c.sug*16,drinkSugar:c.sug*4};
}
function dayStats(k){
  const f=foodTotals(k),c=D.caf(k),sl=D.sleep(k),g=D.gym(k);
  return{study:D.study(k),read:D.read(k),water:D.water(k),kcal:f.kcal,sugar:f.sugar,protein:f.protein,gym:!!(g&&g.done),tasks:D.tdone(k),sleep:sl?sleepMin(sl):0,caff:c.cof*95+c.tea*40};
}
function sleepMin(s){if(!s||!s.bed||!s.wake)return 0;return (pm(s.wake)-pm(s.bed)+1440)%1440}

/* ========== التحية بتوقيت مصر ========== */
function cairoHour(){try{return(+new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',hour:'numeric',hour12:false}).format(new Date()))%24}catch(e){return new Date().getHours()}}
function greeting(){const h=cairoHour();return h>=5&&h<12?'صباح الخير':h>=12&&h<17?'نهارك سعيد':'مساء الخير'}
const me=()=>(st.get('profile',{}).name||'').trim();
const firstName=()=>me().split(/\s+/)[0]||'';
