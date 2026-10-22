/* ========== الماء والمشروبات والنوم ========== */
function addWater(ml){
  const a=st.get('water',{}),k=td();a[k]=Math.max(0,(a[k]||0)+ml);st.set('water',a);
  if(ml>0&&a[k]>=cfg.water.goal&&a[k]-ml<cfg.water.goal)toast('أنجزت هدف الماء اليوم');
}
function setCaf(k,f,v){const a=st.get('caf',{});a[k]=Object.assign({cof:0,tea:0,sug:0,last:''},a[k]||{});f(a[k]);st.set('caf',a)}
let cafSug=0;
function glassSvg(p){
  p=clamp(p,0,1);const y=150-p*120;
  return '<svg viewBox="0 0 120 170" class="glass" aria-hidden="true"><defs><clipPath id="gcl"><path d="M22 14h76l-9 142a8 8 0 0 1-8 7H39a8 8 0 0 1-8-7z"/></clipPath><linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd1ff"/><stop offset="1" stop-color="#2f8fd0"/></linearGradient></defs><g clip-path="url(#gcl)"><rect x="0" y="'+y+'" width="120" height="170" fill="url(#gw)" style="transition:y 1s"/><path d="M0 '+y+' q15 -7 30 0 t30 0 t30 0 t30 0 v6 h-120z" fill="#bfe8ff" opacity=".55"><animateTransform attributeName="transform" type="translate" from="-30 0" to="0 0" dur="2.4s" repeatCount="indefinite"/></path></g><path d="M22 14h76l-9 142a8 8 0 0 1-8 7H39a8 8 0 0 1-8-7z" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3"/></svg>';
}
RD.water=()=>{
  const k=td(),w=D.water(k),g=cfg.water.goal,cup=cfg.water.cup,c=D.caf(k),caff=c.cof*95+c.tea*40,lim=cfg.caf.limit;
  const wcard=card('الماء','<div class="row" style="gap:18px;align-items:center"><div style="width:110px;flex:none">'+glassSvg(w/g)+'</div><div class="grow"><div class="big-n ac">'+w+'<small style="font-size:1rem"> مل</small></div><div class="mut">من '+g+' مل · '+Math.min(100,Math.round(w/g*100))+'٪</div>'+bar(w/g)+'</div></div>'+
    '<div class="row" style="margin-top:12px"><button class="btn" data-a="wadd" data-v="'+cup+'">+ كوب ('+cup+')</button><button class="btn g" data-a="wadd" data-v="500">+ 500</button><button class="btn g" data-a="wadd" data-v="-'+cup+'">تراجع</button></div>'+
    '<div class="row" style="margin-top:10px"><label class="f">الهدف (مل)<input type="number" step="250" min="1000" max="6000" value="'+g+'" data-c="wgoal" style="width:110px"></label><label class="f">حجم الكوب<input type="number" step="50" min="100" max="1000" value="'+cup+'" data-c="wcup" style="width:100px"></label></div>'+
    '<label class="row sm" style="margin-top:8px"><input type="checkbox" data-c="wrem" '+(cfg.remWater?'checked':'')+'> تذكير بالماء كل ساعتين أثناء النهار (يعمل والتطبيق مفتوح)</label>');
  const cc=card('القهوة والشاي','<div class="tiles"><div class="tile"><b>'+c.cof+'</b><span>قهوة</span></div><div class="tile"><b>'+c.tea+'</b><span>شاي</span></div><div class="tile"><b class="'+(caff>lim?'bad':'ok')+'">'+caff+'</b><span>كافيين/مجم · الحد '+lim+'</span></div><div class="tile"><b class="'+(c.sug>2?'warn':'ok')+'">'+c.sug+'</b><span>ملاعق سكر</span></div></div>'+
    '<div class="b" style="margin:12px 0 6px">ملاعق السكر في الكوب القادم</div><div class="chips">'+[0,1,2,3].map(v=>chip(cafSug===v,'data-a="cafsug" data-v="'+v+'"',v===0?'بدون':v)).join('')+'</div>'+
    '<div class="row" style="margin-top:10px"><button class="btn" data-a="cafadd" data-t="cof">+ قهوة</button><button class="btn" data-a="cafadd" data-t="tea">+ شاي</button><button class="btn g" data-a="cafundo">تراجع</button></div>'+
    (c.last?'<div class="mut sm" style="margin-top:8px">آخر كوب الساعة '+c.last+'</div>':'')+
    (caff>lim?'<p class="warn sm">تجاوزت حد الكافيين الذي وضعته. جرّب الماء أو الأعشاب الدافئة.</p>':'')+
    '<p class="mut sm" style="margin:8px 0 0">الأفضل أن يكون آخر كوب قبل النوم بثماني ساعات على الأقل. القهوة والشاي بلا سكر هما الأفضل لهدفك، وكل ملعقة تساوي نحو 16 سعرة و4 جم سكر وتُضاف تلقائياً لقسم الأكل.</p>');
  // نوم
  const sl=D.sleep(k),di=dayItems(k),bedT=di.items.find(x=>x.id==='sleep'),wk=pm(winOf(wdOf(addDays(k,1)))[0])-10;
  const slm=sl?sleepMin(sl):0,tg=cfg.sleep.target;
  const last=ago(7).map(d=>{const s=D.sleep(d),m=s?sleepMin(s):0;return{l:DN[wdOf(d)].slice(0,3),v:+(m/60).toFixed(1),c:m>=tg?'#b7d68b':m>=tg-60?'#e0c36a':'#e8806a'}});
  const hasD=last.filter(x=>x.v);const avg=hasD.length?(sum(hasD.map(x=>x.v))/hasD.length).toFixed(1):'—';
  const lastBed=st.get('sleep',{});
  const sc=card('النوم','<div class="row" style="gap:12px"><label class="f grow">نمت الساعة<input type="time" id="slb" value="'+esc(sl?sl.bed:'')+'"></label><label class="f grow">استيقظت الساعة<input type="time" id="slw" value="'+esc(sl?sl.wake:'')+'"></label></div>'+
    '<div class="row" style="margin-top:8px;gap:6px"><span class="sm mut">الجودة</span>'+[1,2,3,4,5].map(v=>chip(sl&&sl.q===v,'data-a="slq" data-v="'+v+'"','★'.repeat(1)+v)).join('')+'<button class="btn s" data-a="slsave" style="margin-inline-start:auto">حفظ</button></div>'+
    (sl&&slm?'<div class="tile" style="margin-top:10px"><b class="'+(slm>=tg?'ok':slm>=tg-60?'warn':'bad')+'">'+(slm/60).toFixed(1)+' ساعة</b><span>الهدف '+(tg/60)+' ساعات. '+(slm>=tg?'ممتاز':'ينقصك '+Math.round((tg-slm)/60*10)/10+' ساعة')+'</span></div>':'')+
    '<div class="b" style="margin:14px 0 6px">خطة الليلة</div><div class="tiles"><div class="tile"><b class="num">'+t12(di.bed)+'</b><span>موعد النوم المقترح</span></div><div class="tile"><b class="num">'+t12(wk)+'</b><span>الاستيقاظ غداً</span></div><div class="tile"><b class="'+sleepClass(di.sleepMin)+'">'+(di.sleepMin/60).toFixed(1)+' س</b><span>مدة النوم المتاحة</span></div></div>'+
    (di.sleepMin<tg-30?'<p class="warn sm" style="margin:8px 0 0">نومك أقل من هدفك بنحو '+((tg-di.sleepMin)/60).toFixed(1)+' ساعة. نم أبكر أو أخّر تمرين الليلة أو اختصر نشاطاً.</p>':'')+
    '<div class="row" style="margin-top:8px"><label class="f">هدف النوم (ساعات)<input type="number" step="0.5" min="5" max="11" value="'+(tg/60)+'" data-c="sltg" style="width:100px"></label><label class="f">أبكر موعد نوم<input type="time" value="'+esc(cfg.sleep.bed)+'" data-c="slbed"></label></div>'+
    '<div class="b" style="margin:12px 0 4px">آخر 7 أيام (متوسط '+avg+' س)</div>'+bars(last,{max:10,fmt:v=>v}),{cls:'full'});
  const wl=ago(7).map(d=>({l:DN[wdOf(d)].slice(0,3),v:D.water(d),c:D.water(d)>=g?'#7fd1ff':'#5a89a8'}));
  const wch=card('الماء آخر 7 أيام',bars(wl,{max:Math.max(g,1)}));
  return '<div class="grid">'+wcard+cc+sc+wch+'</div>';
};
ACT.wadd=t=>{addWater(+t.dataset.v);renderSec('water')};
CHG.wgoal=t=>{cfg.water.goal=clamp(parseInt(t.value,10)||2500,1000,6000);saveCfg();renderSec('water')};
CHG.wcup=t=>{cfg.water.cup=clamp(parseInt(t.value,10)||250,100,1000);saveCfg();renderSec('water')};
CHG.wrem=t=>{cfg.remWater=t.checked;saveCfg();if(t.checked&&window.Notification&&Notification.permission==='default')Notification.requestPermission();toast(t.checked?'تم تفعيل تذكير الماء':'أُوقف تذكير الماء')};
ACT.cafsug=t=>{cafSug=+t.dataset.v;renderSec('water')};
ACT.cafadd=t=>{const k=td(),ty=t.dataset.t,n=new Date();setCaf(k,c=>{c[ty]++;c.sug+=cafSug;c.last=pad(n.getHours())+':'+pad(n.getMinutes())});renderSec('water')};
ACT.cafundo=()=>{setCaf(td(),c=>{if(c.cof+c.tea>0){if(c.cof>=c.tea)c.cof--;else c.tea--;c.sug=Math.max(0,c.sug-cafSug)}});renderSec('water')};
let slQ=0;
ACT.slq=t=>{slQ=+t.dataset.v;$$('[data-a=slq]').forEach(b=>b.classList.toggle('on',b===t))};
ACT.slsave=()=>{const b=$('#slb').value,w=$('#slw').value;if(!b||!w){toast('اكتب وقت النوم والاستيقاظ');return}const a=st.get('sleep',{}),k=td();a[k]={bed:b,wake:w,q:slQ||(a[k]&&a[k].q)||0};st.set('sleep',a);renderSec('water');toast('حُفظ النوم')};
CHG.sltg=t=>{cfg.sleep.target=clamp(Math.round(num(t.value,8)*60),300,660);saveCfg();renderSec('water')};
CHG.slbed=t=>{cfg.sleep.bed=t.value||'21:30';saveCfg();renderSec('water')};

/* ========== الروتين ========== */
let rtDate=null;
RD.routine=()=>{
  const today=td(),k=rtDate||today,isT=k===today,di=dayItems(k),nm=nowMin(),dn=rtDone(k);
  const strip='<div class="chips" style="margin-bottom:10px">'+[0,1,2,3,4,5,6].map(i=>{const d=addDays(today,i);return chip(d===k,'data-a="rtday" data-d="'+d+'"',(i===0?'اليوم':DN[wdOf(d)]))}).join('')+'</div>';
  const nn=isT?nowNext(di.items,nm):{cur:null,next:null};
  const cnt=di.items.filter(x=>x.tag!=='sleep');const dc=cnt.filter(x=>dn[x.id]).length;
  const head=card(isT?'الآن':ymd(k),(isT?(nn.cur?'<div class="b" style="font-size:1.2rem">'+esc(nn.cur.label)+'</div><div class="mut sm">حتى '+t12(nn.cur.t1)+'</div>':'<div class="mut">لا نشاط جارٍ</div>')+(nn.next?'<div class="sm" style="margin-top:6px">التالي: <b>'+esc(nn.next.label)+'</b> '+t12(nn.next.t0)+' (بعد '+dur(nn.next.t0-nm)+')</div>':''):'')+
    '<div class="row sp sm" style="margin-top:10px"><span>أنجزت '+dc+' من '+cnt.length+'</span><span class="num">نوم '+(di.sleepMin/60).toFixed(1)+' س</span></div>'+bar(dc/Math.max(1,cnt.length)),{cls:'full'+(nn.cur?' glow':'')});
  const rows=di.items.map(x=>{
    const col=({study:'#8fb3ff',pray:'#b7d68b',lesson:'#d98c5f',gym:'#e8806a',food:'#e0c36a',rest:'#a7b5b1',read:'#e8a1c9',sleep:'#7a8cc7',move:'#8a8f98',school:'#c8a27a',custom:'#b8a5ff'})[x.tag]||'#a7b5b1';
    const isNow=isT&&nm>=x.t0&&nm<Math.max(x.t1,x.t0+1)&&x.tag!=='sleep';
    const canFocus=x.tag==='study'&&x.subj&&x.id!=='en'||x.tag==='read';
    return '<li class="'+(dn[x.id]?'done':'')+(isNow?' now':'')+'" style="border-inline-start:3px solid '+col+';padding-inline-start:10px"><input type="checkbox" data-c="rtchk" data-id="'+x.id+'" '+(dn[x.id]?'checked':'')+' aria-label="تم"><div class="t"><b>'+esc(x.label)+'</b><div class="mut sm num">'+t12(x.t0)+(x.t1>x.t0?' – '+t12(x.t1):'')+' · '+(TAGN[x.tag]||'')+(x.cf?' <span class="bad">تعارض</span>':'')+(x.warn?' <span class="warn">'+esc(x.warn)+'</span>':'')+'</div></div>'+
      (canFocus&&isT?'<button class="btn s" data-a="rtfocus" data-id="'+x.id+'">ابدأ</button>':'')+
      (x.custom?'<button class="x" data-a="rtcdel" data-id="'+x.custom+'" aria-label="حذف">×</button>':(x.tag!=='sleep'&&x.tag!=='pray'?'<button class="x" data-a="rthide" data-id="'+x.id+'" aria-label="إخفاء" title="إخفاء">–</button>':''))+'</li>';
  }).join('');
  const hidden=st.get('rthide',[]);
  const tl=card('جدول '+(isT?'اليوم':DN[wdOf(k)]),'<ul class="list rt">'+rows+'</ul>'+(hidden.length?'<button class="btn g s" data-a="rtunhide">إظهار المخفي ('+hidden.length+')</button>':''),{cls:'full'});
  const rtc=st.get('rtc',[]);
  const add=card('أضف نشاطاً ثابتاً','<div class="row"><input type="text" id="rc_l" placeholder="مثال: كورس إضافي" class="grow"><input type="time" id="rc_t" value="18:00"><input type="number" id="rc_len" min="5" max="300" value="45" style="width:80px" aria-label="المدة بالدقائق"></div><div style="margin:8px 0 4px" class="sm mut">الأيام</div><div class="chips" id="rc_d">'+WORD.map(w=>chip(0,'data-a="rcday" data-w="'+w+'"',DN[w])).join('')+'</div><div class="row" style="margin-top:10px"><button class="btn" data-a="rcadd">إضافة</button></div>'+
    (rtc.length?'<ul class="list" style="margin-top:8px">'+rtc.map(c=>'<li><span class="t"><b>'+esc(c.label)+'</b><div class="mut sm">'+t12(pm(c.t))+' · '+(c.days||[]).map(d=>DN[d]).join('، ')+'</div></span><button class="x" data-a="rtcdel" data-id="'+c.id+'" aria-label="حذف">×</button></li>').join('')+'</ul>':''));
  const tips=card('كيف يعمل الجدول','<ul class="list"><li><span class="t">يُبنى تلقائياً من مواعيد الصلاة في '+esc(cfg.loc.name)+' ودروسك وخيار الجيم الذي اخترته.</span></li><li><span class="t">إن تداخل نشاطان ظهرت كلمة «تعارض».</span></li><li><span class="t">موعد النوم يُحسب من آخر نشاط ليتبيّن لك كم ساعة نوم ستحصل.</span></li></ul>');
  return strip+'<div class="grid">'+head+tl+add+tips+'</div>';
};
PO.routine=()=>{};
let rcDays=[];
ACT.rtday=t=>{rtDate=t.dataset.d;renderSec('routine')};
CHG.rtchk=t=>{setRtDone(rtDate||td(),t.dataset.id,t.checked);renderSec('routine')};
ACT.rthide=t=>{const a=st.get('rthide',[]);a.push(t.dataset.id);st.set('rthide',a);renderSec('routine')};
ACT.rtunhide=()=>{st.set('rthide',[]);renderSec('routine')};
ACT.rtfocus=t=>{
  const di=dayItems(td()),x=di.items.find(i=>i.id===t.dataset.id);if(!x)return;
  if(x.tag==='read')startFocus({kind:'read',m:Math.max(10,x.t1-x.t0),label:'قراءة'});
  else startFocus({subj:x.subj,m:Math.max(10,Math.min(90,x.t1-x.t0)),bi:x.bi});
};
ACT.rcday=t=>{const w=+t.dataset.w,i=rcDays.indexOf(w);if(i<0)rcDays.push(w);else rcDays.splice(i,1);t.classList.toggle('on',i<0)};
ACT.rcadd=()=>{
  const l=$('#rc_l').value.trim(),tm=$('#rc_t').value,len=clamp(parseInt($('#rc_len').value,10)||30,5,300);
  if(!l||!tm||!rcDays.length){toast('اكتب الاسم والوقت واختر يوماً واحداً على الأقل');return}
  const a=st.get('rtc',[]);a.push({id:uid(),label:l,t:tm,len:len,days:rcDays.slice(),tag:'custom'});st.set('rtc',a);rcDays=[];renderSec('routine');toast('أُضيف النشاط');
};
ACT.rtcdel=t=>{st.set('rtc',st.get('rtc',[]).filter(c=>c.id!==t.dataset.id));renderSec('routine')};
