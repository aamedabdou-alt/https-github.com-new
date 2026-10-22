/* ========== واجهة عامة ========== */
const RD={},PO={},ACT={},CHG={},INP={};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t&&ACT[t.dataset.a]){try{ACT[t.dataset.a](t,e)}catch(x){console.error(x);toast('حدث خطأ غير متوقع')}}});
document.addEventListener('change',e=>{const t=e.target.closest('[data-c]');if(t&&CHG[t.dataset.c]){try{CHG[t.dataset.c](t,e)}catch(x){console.error(x);toast('حدث خطأ غير متوقع')}}});
document.addEventListener('input',e=>{const t=e.target.closest('[data-i]');if(t&&INP[t.dataset.i]){try{INP[t.dataset.i](t,e)}catch(x){console.error(x)}}});

function ring(p,center,label,sub,color,goto){
  p=clamp(p,0,1);const C=2*Math.PI*34;
  return '<div class="ringbox"'+(goto?' data-a="go" data-g="'+goto+'"':'')+'><div class="ring" style="--c:'+color+'"><svg viewBox="0 0 84 84"><circle class="tr" cx="42" cy="42" r="34"/><circle class="pr" cx="42" cy="42" r="34" stroke-dasharray="'+C+'" stroke-dashoffset="'+C+'" data-off="'+(C*(1-p))+'"/></svg><b>'+center+'</b></div><span class="b sm">'+label+'</span><span class="mut sm">'+(sub||'')+'</span></div>';
}
function animRings(){requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.pr[data-off]').forEach(c=>{c.style.strokeDashoffset=c.dataset.off})))}
function bars(data,o){
  o=o||{};const mx=o.max||Math.max.apply(null,data.map(d=>d.v).concat([1]));
  return '<div class="bars">'+data.map(d=>'<div class="bc"><em>'+(d.v?(o.fmt?o.fmt(d.v):Math.round(d.v)):'')+'</em><div class="bv" style="height:'+clamp(d.v/mx*100,0,100)+'%;'+(d.c?'background:'+d.c:'')+'"></div><small>'+d.l+'</small></div>').join('')+'</div>';
}
function bar(p,cls){return '<div class="bar '+(cls||'')+'"><i style="width:'+clamp(p*100,0,100)+'%"></i></div>'}
const card=(title,body,o)=>'<div class="card '+((o&&o.cls)||'')+'"'+((o&&o.id)?' id="'+o.id+'"':'')+'><h3><span>'+title+'</span>'+((o&&o.r)?'<small>'+o.r+'</small>':'')+'</h3>'+body+'</div>';
const chip=(on,attrs,txt)=>'<button class="chip'+(on?' on':'')+'" '+attrs+'>'+txt+'</button>';
function opts(arr,sel){return arr.map(x=>{const v=Array.isArray(x)?x[0]:x,l=Array.isArray(x)?x[1]:x;return '<option value="'+esc(v)+'"'+(String(v)===String(sel)?' selected':'')+'>'+esc(l)+'</option>'}).join('')}
function dayChips(sel,attr){return '<div class="chips">'+WORD.map(w=>chip(sel.includes(w),'data-a="'+attr+'" data-w="'+w+'"',DN[w])).join('')+'</div>'}

/* ========== IndexedDB ========== */
const DB={
  open(n,s,o){return new Promise((r,j)=>{const q=indexedDB.open(n,1);q.onupgradeneeded=()=>q.result.createObjectStore(s,o);q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)})},
  async tx(n,s,o,mode,fn){const db=await DB.open(n,s,o);return new Promise((r,j)=>{const t=db.transaction(s,mode),q=fn(t.objectStore(s));t.oncomplete=()=>r(q&&q.result);t.onerror=()=>j(t.error)})}
};
const libTx=(m,fn)=>DB.tx('ab-lib','f',{keyPath:'id',autoIncrement:true},m,fn);
const bgTx=(m,fn)=>DB.tx('ab-bg','k',{},m,fn);

/* ========== التنقل ========== */
const ICO={home:'M3 11l9-8 9 8v10h-6v-6H9v6H3z',study:'M2 5h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z',tasks:'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',log:'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6zM9 3v18M12 8h4M12 12h4',gym:'M6 6v12M3 9v6M18 6v12M21 9v6M6 12h12',food:'M12 7c-3-3-8-1-8 5 0 5 3 9 5 9 1 0 2-.7 3-.7s2 .7 3 .7c2 0 5-4 5-9 0-6-5-8-8-5zM12 7c0-2 1-4 3-4',water:'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',routine:'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',alarm:'M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0',read:'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11',notes:'M4 20l1-5L16 4l4 4L9 19zM14 6l4 4',lib:'M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',insp:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',set:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',more:'M4 7h16M4 12h16M4 17h16'};
const NAVPRI=['home','study','tasks','routine'];
const tabBtn=(s,cls)=>'<button class="tab'+(cls||'')+'" data-a="go" data-g="'+s.id+'" style="--c:'+s.c+'" aria-label="'+s.n+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+ICO[s.id]+'"/></svg><span>'+s.n+'</span></button>';
function buildShell(){
  $('#tabs').innerHTML=SEC.map(s=>tabBtn(s,NAVPRI.includes(s.id)?' pri':'')).join('')+'<button class="tab moreb" data-a="more" style="--c:var(--acc)" aria-label="المزيد"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+ICO.more+'"/></svg><span>المزيد</span></button>';
  const dg=n=>String(n).padStart(2,'0').replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
  $('#main').innerHTML=SEC.map((s,i)=>'<section class="sec" id="s-'+s.id+'" data-sec="'+s.id+'" aria-label="'+s.n+'"><div class="sh"><div><div class="eyb"><b>'+dg(i+1)+'</b><span>'+dg(SEC.length)+'</span></div><h2>'+s.n+'</h2><p class="mut">'+s.sub+'</p></div></div><div id="b-'+s.id+'"></div></section>').join('');
}
ACT.more=()=>sheet('<h3>كل الأقسام</h3><div class="moregrid">'+SEC.map(s=>tabBtn(s,s.id===curSec?' on':'')).join('')+'</div>');
function renderSec(id){
  id=id||curSec;const f=RD[id];if(!f)return;const el=$('#b-'+id);if(!el)return;
  const keep=window.scrollY;el.innerHTML=f();if(PO[id])PO[id]();animRings();if(keep&&id===curSec)window.scrollTo(0,keep);
}
function go(id){
  if(!SEC.find(s=>s.id===id))id='home';
  $$('.sec').forEach(s=>s.classList.toggle('on',s.dataset.sec===id));
  $$('#tabs .tab').forEach(t=>{const on=t.dataset.g===id;t.classList.toggle('on',on);if(on)try{t.scrollIntoView({inline:'center',block:'nearest',behavior:RM?'auto':'smooth'})}catch(e){}});
  curSec=id;applySkin(id);embShow(secOf(id).em,$('#s-'+id+' .emb'));renderSec(id);st.set('tab',id);
  try{history.replaceState(null,'','#'+id)}catch(e){}
  window.scrollTo(0,0);if(A)G.fromTo('#s-'+id,{opacity:0,y:14},{opacity:1,y:0,duration:.5});
}
ACT.go=t=>{closeSheet();go(t.dataset.g)};

/* ========== نافذة الخلفية ========== */
let bgScope='sec';
function bgSheet(){
  bgScope=cfg.bg.mode==='fixed'?'all':'sec';openBg();
}
function openBg(){
  const cur=skinIdFor(curSec),hasC=cfg.bg.custom.kind;
  const tl=l=>l.map(s=>'<button class="skt'+(cur===s.id?' on':'')+'" data-a="pickskin" data-s="'+s.id+'" style="background:'+(s.pk?paperBg(s.pk,cfg.theme):s.bg)+'"><span>'+s.n+'</span></button>').join('');
  const grp=(t,g)=>'<div class="b sm" style="grid-column:1/-1;margin-top:6px">'+t+'</div>'+tl(SKINS.filter(s=>s.g===g));
  const tiles=grp('هادئ داكن','dark')+grp('هادئ فاتح','light')+grp('ورق للمذاكرة','paper')+
    (hasC?'<div class="b sm" style="grid-column:1/-1;margin-top:6px">خلفيتك</div><button class="skt'+(cur==='custom'?' on':'')+'" data-a="pickskin" data-s="custom" style="background:'+(cfg.bg.custom.kind==='image'&&bgUrl?'url('+bgUrl+') center/cover':cfg.bg.custom.color)+'"><span>مخصصة</span></button>':'');
  sheet('<h3>تغيير الخلفية</h3><div class="row" style="margin-bottom:10px"><label class="btn">اختر صورة من جهازك<input type="file" accept="image/*" hidden data-c="bgfile"></label>'+(hasC&&cfg.bg.custom.kind==='image'?'<button class="btn g" data-a="bgrmimg">إزالة صورتي</button>':'')+'<label class="f" style="flex-direction:row;align-items:center;gap:8px">لون ثابت <input type="color" data-c="bgcolor" value="'+esc(cfg.bg.custom.color||'#101820')+'"></label></div><p class="mut sm">اختر خلفية لهذا القسم، أو طبّق واحدة على كل الأقسام.</p>'+
    '<div class="chips">'+chip(bgScope==='sec','data-a="bgscope" data-v="sec"','لهذا القسم فقط')+chip(bgScope==='all','data-a="bgscope" data-v="all"','لكل الأقسام')+'</div>'+
    '<div class="skins" style="margin:14px 0">'+tiles+'</div>'+
    (cur==='custom'&&hasC==='image'?'<label class="f">تعتيم صورتك لتسهيل القراءة <input type="range" min="0" max="80" value="'+Math.round(cfg.bg.dim*100)+'" data-i="bgdim"></label>':'')+
    '<div class="row" style="margin-top:14px"><button class="btn g s" data-a="bgreset">إرجاع الخلفية الافتراضية</button><button class="btn g" data-a="themesheet">ألوان الخط والورق</button><button class="btn" data-close>تم</button></div>');
}
ACT.bgsheet=bgSheet;
ACT.bgscope=t=>{bgScope=t.dataset.v;openBg()};
ACT.pickskin=t=>{
  const id=t.dataset.s;
  if(bgScope==='all'){cfg.bg.mode='fixed';cfg.bg.fixed=id}else{cfg.bg.mode='section';cfg.bg.per[curSec]=id}
  saveCfg();applySkin();openBg();
};
ACT.bgreset=()=>{cfg.bg.mode='fixed';cfg.bg.fixed='night';cfg.bg.per={};saveCfg();applySkin();openBg();toast('رجعت الخلفية الافتراضية')};
INP.bgdim=t=>{cfg.bg.dim=t.value/100;saveCfg();applySkin()};
CHG.bgcolor=t=>{cfg.bg.custom={kind:'color',color:t.value,lum:lumOfHex(t.value)};if(bgScope==='all'){cfg.bg.mode='fixed';cfg.bg.fixed='custom'}else{cfg.bg.mode='section';cfg.bg.per[curSec]='custom'}saveCfg();applySkin();openBg()};
CHG.bgfile=async t=>{
  const f=t.files&&t.files[0];if(!f)return;
  try{
    const bmp=await new Promise((res,rej)=>{const u=URL.createObjectURL(f),im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=u});
    const k=Math.min(1,1600/Math.max(bmp.width,bmp.height)),cv=document.createElement('canvas');cv.width=Math.round(bmp.width*k);cv.height=Math.round(bmp.height*k);cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);
    const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',.82));
    await bgTx('readwrite',s=>s.put(blob,'img'));
    if(bgUrl)URL.revokeObjectURL(bgUrl);bgUrl=URL.createObjectURL(blob);
    cfg.bg.custom={kind:'image',color:cfg.bg.custom.color||'#101820',lum:lumOfCanvas(cv)};
    bgScope='all';cfg.bg.mode='fixed';cfg.bg.fixed='custom';cfg.bg.per={};
    saveCfg();applySkin();openBg();toast('تم تعيين صورتك كخلفية');
  }catch(e){toast('تعذر قراءة الصورة')}
  t.value='';
};
function lumOfRGB(r,g,b){const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)}
function lumOfHex(h){h=(h||'#000').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return lumOfRGB(parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16))}
function lumOfCanvas(cv){const t=document.createElement('canvas');t.width=t.height=24;const x=t.getContext('2d');x.drawImage(cv,0,0,24,24);const d=x.getImageData(0,0,24,24).data;let s=0,n=0;for(let i=0;i<d.length;i+=4){s+=lumOfRGB(d[i],d[i+1],d[i+2]);n++}return s/n}
async function loadBgImg(){try{const b=await bgTx('readonly',s=>s.get('img'));if(b){bgUrl=URL.createObjectURL(b);if(cfg.bg.custom&&cfg.bg.custom.lum==null){const bm=await createImageBitmap(b),c=document.createElement('canvas');c.width=c.height=48;c.getContext('2d').drawImage(bm,0,0,48,48);cfg.bg.custom.lum=lumOfCanvas(c);saveCfg()}}}catch(e){}}

/* ========== الاقتباسات ========== */
const Q=[
['a','وَقُل رَّبِّ زِدْنِي عِلْمًا','طه 114'],['a','إِنَّ مَعَ الْعُسْرِ يُسْرًا','الشرح 6'],['a','وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ','النجم 39'],
['a','فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ','آل عمران 159'],['a','وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ','الطلاق 3'],
['a','يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ','المجادلة 11'],
['a','فَاسْتَبِقُوا الْخَيْرَاتِ','البقرة 148'],['a','وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ','النحل 127'],['a','رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي','طه 25-26'],
['h','مَن سلك طريقًا يلتمس فيه علمًا سهّل الله له به طريقًا إلى الجنة','رواه مسلم'],['h','احرص على ما ينفعك واستعن بالله ولا تعجز','رواه مسلم'],
['h','إن الله يحب إذا عمل أحدكم عملًا أن يتقنه','رواه البيهقي'],['h','نعمتان مغبون فيهما كثير من الناس: الصحة والفراغ','رواه البخاري'],
['h','المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف وفي كلٍّ خير','رواه مسلم'],
['m','المذاكرة الهادئة كل يوم أقوى من اندفاع ليلة واحدة.',''],['m','لا تنتظر الحافز؛ ابدأ بخمس دقائق وسيأتي.',''],['m','اهدأ وتنفّس وأكمل خطوتك التالية.',''],['m','تعبك اليوم يصنع راحتك غداً.',''],
['m','عِش نمط الحياة الذي تريده قبل أن تبلغ نتيجته.',''],['m','غيّر ما تريده من نفسك، لا ما تفعله فقط.',''],
['e','Calm focus beats frantic hours.',''],['e','Start small. Keep going. Trust the process.',''],['e','Code a little, review a little, rest well.',''],['e','Your future self is quietly thanking you right now.','']];
const qh=q=>'<div class="qt" dir="'+(q[0]==='e'?'ltr':'rtl')+'">'+esc(q[1])+'</div>'+(q[2]?'<small class="mut">'+esc(q[2])+'</small>':'');
const rq=()=>Q[Math.floor(Math.random()*Q.length)];

ACT.bgrmimg=async()=>{try{await bgTx('readwrite',s=>s.delete('img'))}catch(e){}if(bgUrl){URL.revokeObjectURL(bgUrl);bgUrl=''}cfg.bg.custom={kind:'',color:cfg.bg.custom.color||'#101820'};cfg.bg.mode='fixed';cfg.bg.fixed='night';cfg.bg.per={};saveCfg();applySkin();openBg();toast('أُزيلت صورتك')};


/* ========== ألواني: الخط والورق والسطور والبطاقات والتمييز ========== */
const hex2rgb=h=>{h=(h||'#000000').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const contrast=(a,b)=>{const x=lumOfHex(a),y=lumOfHex(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
function applyTheme(){
  const T=cfg.theme||{},r=document.body.style,b=document.body;
  const set=(k,v)=>v?r.setProperty(k,v):r.removeProperty(k);
  set('--ink',T.ink);set('--hd',T.hd);
  if(T.hd){const[x,y,z]=hex2rgb(T.hd);r.setProperty('--hd2','rgba('+x+','+y+','+z+',.78)')}else r.removeProperty('--hd2');
  if(T.card){const[x,y,z]=hex2rgb(T.card);r.setProperty('--card','rgba('+x+','+y+','+z+',.92)')}else r.removeProperty('--card');
  if(T.acc)r.setProperty('--onacc',lumOfHex(T.acc)>.35?'#101820':'#ffffff');else r.removeProperty('--onacc');
  b.classList.toggle('hdc',!!T.hd);
}
const thDef=()=>document.body.classList.contains('lt')?{hd:'#2b2a26',ink:'#1e2530',card:'#ffffff'}:{hd:'#e7eaf0',ink:'#e7eaf0',card:'#171c24'};
function effPaper(){const s=SKINS.find(x=>x.id===skinIdFor(curSec));const T=cfg.theme||{};return s&&s.pk?(T.paper||s.pk.p):null}
function crBadge(v){const t=v>=7?['ok','ممتاز']:v>=4.5?['ok','جيد']:v>=3?['mid','ضعيف']:['no','غير مقروء'];return '<span class="cr '+t[0]+'">'+v.toFixed(1)+' · '+t[1]+'</span>'}
const THEME_PRESETS=[
  {n:'الافتراضي',t:{}},
  {n:'فاتح نظيف',t:{paper:'#f4f5f8',line:'#d5dae3',margin:'#e0b0b0',hd:'#1c2330',ink:'#1c2330',card:'#ffffff',acc:'#4a67d6'}},
  {n:'دافئ مريح',t:{paper:'#f3e6c8',line:'#c9ad7a',margin:'#c06a4a',hd:'#3a2a1a',ink:'#f2e9d8',card:'#2a2118',acc:'#c9873a'}},
  {n:'أخضر هادئ',t:{paper:'#e8f1e4',line:'#a9c7a4',margin:'#c98a8a',hd:'#1f3a2a',ink:'#e8f1e8',card:'#12281c',acc:'#4f9a6a'}},
  {n:'ليلي عميق',t:{paper:'#14181f',line:'#252c38',margin:'#4a3a3a',hd:'#e7eaf0',ink:'#e7eaf0',card:'#0d1117',acc:'#8aa4f0'}}
];
function themeBody(){
  const T=cfg.theme||{},P=effPaper();
  const dp=P||'#f6f1e3',s=SKINS.find(x=>x.id===skinIdFor(curSec)),pk=s&&s.pk;
  const D=thDef(),hdv=T.hd||D.hd;
  const inkv=T.ink||D.ink,cardv=T.card||D.card;
  const row=(k,l,sub,v)=>'<div class="throw"><div>'+l+'<small>'+sub+'</small></div><input type="color" data-i="theme" data-k="'+k+'" value="'+v+'"></div>';
  return '<div class="chips" style="margin:8px 0">'+THEME_PRESETS.map((p,i)=>'<button class="chip" data-a="themepre" data-n="'+i+'">'+p.n+'</button>').join('')+'</div>'+
   (pk?row('paper','لون الورق','خلفية الصفحة نفسها',T.paper||pk.p)+row('line','لون السطور','الخطوط الأفقية أو المربعات',T.line||pk.l)+(pk.m?row('margin','لون الهامش','الخط الجانبي',T.margin||pk.m):''):'<p class="mut sm">ألوان الورق تظهر عند اختيار ورقة مسطرة أو مربعات.</p>')+
   row('hd','لون العناوين والخط على الورق','الأسماء والعناوين خارج البطاقات',hdv)+
   row('ink','لون الخط داخل البطاقات','نص البطاقات والخيارات',inkv)+
   row('card','لون البطاقات','خلفية البطاقات والنوافذ',cardv)+
   row('acc','لون الأزرار والتمييز','الأزرار والخيارات المحددة',T.acc||secOf(curSec).c)+
   '<div class="thprev" id="thprev"></div>'+
   '<div class="row" style="margin-top:10px"><button class="btn g s" data-a="themefix">تصحيح التباين تلقائياً</button><button class="btn g s" data-a="themereset">إرجاع الألوان الافتراضية</button><button class="btn" data-close>تم</button></div>';
}
function themePrev(){
  const el=$('#thprev');if(!el)return;
  const T=cfg.theme||{},P=effPaper(),lt=document.body.classList.contains('lt');
  const D=thDef(),hdv=T.hd||D.hd,inkv=T.ink||D.ink,cardv=T.card||D.card;
  const paperc=P||(lt?'#eef1f5':'#0f1318');
  el.innerHTML='<div style="background:'+paperc+';color:'+hdv+';padding:10px 12px;border-radius:10px;margin-bottom:8px"><b>عنوان على الورق</b> — نص تجريبي '+crBadge(contrast(hdv,paperc))+'</div>'+
   '<div style="background:'+cardv+';color:'+inkv+';padding:10px 12px;border-radius:10px;margin-bottom:8px"><b>بطاقة</b> — نص تجريبي '+crBadge(contrast(inkv,cardv))+'</div>'+
   '<div><span class="btn s" style="background:'+(T.acc||secOf(curSec).c)+';color:'+(lumOfHex(T.acc||secOf(curSec).c)>.35?'#101820':'#fff')+'">زر</span> '+crBadge(contrast(lumOfHex(T.acc||secOf(curSec).c)>.35?'#101820':'#ffffff',T.acc||secOf(curSec).c))+'</div>'+
   '<p class="mut sm" style="margin:8px 0 0">أقل تباين مقبول للقراءة 4.5، والأفضل 7 فأكثر.</p>';
}
ACT.themesheet=()=>{sheet('<h3>ألواني</h3><p class="mut sm" style="margin:4px 0">غيّر لون الورق والسطور والخط والبطاقات. التغيير فوري ويُحفظ على جهازك.</p>'+themeBody(),themePrev);setTimeout(themePrev,30)};
INP.theme=t=>{cfg.theme=cfg.theme||{};cfg.theme[t.dataset.k]=t.value;saveCfg();applySkin();themePrev()};
ACT.themepre=t=>{cfg.theme=JSON.parse(JSON.stringify(THEME_PRESETS[+t.dataset.n].t));saveCfg();applySkin();ACT.themesheet()};
ACT.themereset=()=>{cfg.theme={};saveCfg();applySkin();ACT.themesheet();toast('رجعت الألوان الافتراضية')};
ACT.themefix=()=>{
  const T=cfg.theme=cfg.theme||{},P=effPaper(),lt=document.body.classList.contains('lt');
  const best=bg=>contrast('#111111',bg)>=contrast('#ffffff',bg)?'#14130f':'#f6f6f2';
  const paperc=P||(lt?'#eef1f5':'#0f1318');
  const D=thDef();if(contrast(T.hd||D.hd,paperc)<7)T.hd=best(paperc);
  const cardc=T.card||D.card;if(contrast(T.ink||D.ink,cardc)<7)T.ink=best(cardc);
  const acc=T.acc||secOf(curSec).c;if(contrast(lumOfHex(acc)>.35?'#101820':'#ffffff',acc)<4.5){T.acc=lumOfHex(acc)>.35?'#2f6fb8':'#5fa8e8'}
  saveCfg();applySkin();ACT.themesheet();toast('ضُبط التباين');
};
