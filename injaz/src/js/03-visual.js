/* ========== الأقسام ========== */
const SEC=[
  {id:'home',n:'الرئيسية',sub:'نظرة واحدة على يومك كله',skin:'night',em:'armillary',c:'#8aa4f0'},
  {id:'study',n:'المذاكرة',sub:'جلسات مركّزة بلا تشتت',skin:'night',em:'crystal',c:'#8aa4f0'},
  {id:'tasks',n:'المهام',sub:'اكتب، رتّب، أنجز',skin:'night',em:'cubes',c:'#8aa4f0'},
  {id:'log',n:'السجل اليومي',sub:'ماذا فعلت اليوم وكيف كان شعورك',skin:'night',em:'book',c:'#8aa4f0'},
  {id:'gym',n:'التمارين',sub:'الجيم، الأوزان، والتقدّم',skin:'night',em:'dumbbell',c:'#8aa4f0'},
  {id:'food',n:'الأكل',sub:'سعرات محسوبة وسكر قليل',skin:'night',em:'apple',c:'#8aa4f0'},
  {id:'water',n:'الماء والنوم',sub:'ماء وقهوة وشاي ونوم كافٍ',skin:'night',em:'drop',c:'#8aa4f0'},
  {id:'routine',n:'الروتين',sub:'جدول يومك بالدقيقة',skin:'night',em:'clock',c:'#8aa4f0'},
  {id:'alarm',n:'المنبه',sub:'استيقاظ بإثبات حقيقي',skin:'night',em:'alarmclock',c:'#8aa4f0'},
  {id:'read',n:'القراءة',sub:'ساعة إلى ساعة ونصف كل يوم',skin:'night',em:'openbook',c:'#8aa4f0'},
  {id:'notes',n:'الملاحظات',sub:'اكتب ما تشاء',skin:'night',em:'pencil',c:'#8aa4f0'},
  {id:'lib',n:'مكتبتي',sub:'ملفاتك وملخصاتك',skin:'night',em:'books',c:'#8aa4f0'},
  {id:'insp',n:'إلهام',sub:'آيات وأحاديث وحِكَم',skin:'night',em:'star',c:'#8aa4f0'},
  {id:'set',n:'الإعدادات',sub:'الخلفية والألوان والنسخ الاحتياطي',skin:'night',em:'gear',c:'#8aa4f0'}
];
const secOf=id=>SEC.find(s=>s.id===id)||SEC[0];

/* ========== الخلفيات: هادئة وحديثة وبلا حركة ========== */
const SKINS=[
  {id:'night',n:'ليل هادئ',g:'dark',tc:'#0f1318',bg:"radial-gradient(rgba(255,255,255,.055) 1px,transparent 1.3px) 0 0/22px 22px,radial-gradient(80% 55% at 85% -10%,rgba(138,164,240,.11),transparent 62%),radial-gradient(70% 50% at 0% 110%,rgba(127,191,174,.07),transparent 60%),#0f1318"},
  {id:'ink',n:'أزرق حبري',g:'dark',tc:'#0d1520',bg:"radial-gradient(rgba(255,255,255,.05) 1px,transparent 1.3px) 0 0/22px 22px,radial-gradient(80% 55% at 15% -10%,rgba(110,150,230,.14),transparent 62%),#0d1520"},
  {id:'sage',n:'أخضر ريشي',g:'dark',tc:'#10171a',bg:"radial-gradient(rgba(255,255,255,.05) 1px,transparent 1.3px) 0 0/22px 22px,radial-gradient(80% 55% at 80% -10%,rgba(127,191,174,.13),transparent 62%),#10171a"},
  {id:'plum',n:'بنفسجي رمادي',g:'dark',tc:'#15131b',bg:"radial-gradient(rgba(255,255,255,.05) 1px,transparent 1.3px) 0 0/22px 22px,radial-gradient(80% 55% at 85% -10%,rgba(170,150,230,.12),transparent 62%),#15131b"},
  {id:'graphite',n:'جرافيت',g:'dark',tc:'#121315',bg:"radial-gradient(rgba(255,255,255,.045) 1px,transparent 1.3px) 0 0/22px 22px,#121315"},
  {id:'mist',n:'ضباب فاتح',g:'light',lt:1,tc:'#eef1f5',bg:"radial-gradient(rgba(20,30,50,.10) 1px,transparent 1.3px) 0 0/22px 22px,radial-gradient(80% 55% at 85% -10%,rgba(138,164,240,.14),transparent 62%),#eef1f5"},
  {id:'linen',n:'كتان دافئ',g:'light',lt:1,tc:'#f3efe6',bg:"radial-gradient(rgba(20,30,50,.10) 1px,transparent 1.3px) 0 0/22px 22px,radial-gradient(80% 55% at 15% -10%,rgba(224,185,112,.16),transparent 62%),#f3efe6"},
  {id:'sky',n:'سماء باهتة',g:'light',lt:1,tc:'#e9f1f6',bg:"radial-gradient(rgba(20,30,50,.10) 1px,transparent 1.3px) 0 0/22px 22px,radial-gradient(80% 55% at 85% -10%,rgba(127,191,174,.16),transparent 62%),#e9f1f6"}
].map(o=>Object.assign({acc2:'#7fbfae'},o));
let bgUrl='',skinId='',skinFlip=false,curSec='home';
function skinIdFor(sec){const b=cfg.bg;return b.mode==='fixed'?b.fixed:(b.per[sec]||secOf(sec).skin)}
function applySkin(sec){
  curSec=sec||curSec;let id=skinIdFor(curSec),s=SKINS.find(x=>x.id===id),css,tc='#0f1318';
  if(id==='custom'){
    const c=cfg.bg.custom;s=SKINS[0];
    s=Object.assign({},s,{lt:(c.lum!=null?c.lum>.4:0)?1:0});
    css=(c.kind==='image'&&bgUrl)?'url('+bgUrl+') center/cover no-repeat':(c.kind==='color'?c.color:s.bg);
    if(c.kind==='color')tc=c.color;
  }
  if(!s){s=SKINS[0];id=s.id}
  if(!css)css=s.bg;
  if(s.pk){const T=cfg.theme||{};css=paperBg(s.pk,T);if(T.paper)s=Object.assign({},s,{lt:lumOfHex(T.paper)>.4?1:0});tc=T.paper||s.pk.p}else if(s.tc&&id!=='custom')tc=s.tc;
  const key=id+'|'+css;
  if(key!==skinId){
    skinId=key;skinFlip=!skinFlip;const a=$('#skin .sk.a'),b=$('#skin .sk.b'),nw=skinFlip?a:b,old=skinFlip?b:a;
    nw.style.background=css;nw.classList.add('on');old.classList.remove('on');
  }
  const r=document.documentElement.style;r.setProperty('--acc',(cfg.theme&&cfg.theme.acc)||secOf(curSec).c);r.setProperty('--acc2',s.acc2||'#7fbfae');try{applyTheme()}catch(e){}
  $('#skin .dim').style.opacity=s.lt?0:(id==='custom'?Math.min(cfg.bg.dim*.4,.2):0);
  document.body.classList.toggle('lt',!!s.lt);document.body.classList.toggle('img',id==='custom'&&cfg.bg.custom.kind==='image');
  const tm=$('meta[name=theme-color]');if(tm)tm.content=tc;
}

/* ========== أيقونة القسم: شكل مسطح بدل المجسمات ========== */
function embShow(k,el){
  if(!el)return;const id=curSec,p=(typeof ICO!=='undefined'&&ICO[id])||'';
  el.innerHTML='<div class="eico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+p+'"/></svg></div>';
}
