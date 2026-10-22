/* ========== المنبه الصباحي (إثبات بالكاميرا) + تنبيهات المهام ========== */
const AL={ring:false,k:'',step:0,stream:null,siv:null,osc:null,test:false,t0:0,sigs:[],busy:false,enroll:null};
const ASTEPS=[
  {id:'face',t:'صوّر وجهك والماء عليه',h:'اغسل وجهك ثم التقط صورة لوجهك وهو مبلل.',cam:'user'},
  {id:'head',t:'صوّر رأسك وشعرك مبللاً',h:'بلّل رأسك بالماء ثم التقط صورة تُظهر شعرك ورأسك.',cam:'user'},
  {id:'rug',t:'صوّر سجادة الصلاة',h:'اذهب لسجادة الصلاة وصوّرها بالكاميرا الخلفية.',cam:'environment'}
];
const alog=()=>cfg.alarm.log;
function alarmMin(k){const w=wdOf(k);return cfg.alarm.mode==='fixed'?pm(cfg.alarm.fixed):pm(winOf(w)[0])-cfg.alarm.lead}
function alarmDone(k){return !!(alog()[k]&&alog()[k].done)}
function nextAlarm(){
  const n=nowMin();
  for(let i=0;i<8;i++){
    const d=addDays(td(),i),w=wdOf(d);if(!cfg.alarm.days.includes(w))continue;
    const m=alarmMin(d);if(i===0&&(alarmDone(d)||n>m+240))continue;
    return{d:d,m:m,i:i,skipped:cfg.alarm.skip===d};
  }
  return null;
}
function alarmInfo(){
  const a=cfg.alarm;if(!a.on)return{text:'المنبه متوقف',sub:'فعّله من قسم المنبه.',canCancel:false,skipped:false};
  const x=nextAlarm();if(!x)return{text:'لا منبه قادم',sub:'اختر أيام التشغيل.',canCancel:false,skipped:false};
  const day=x.i===0?'اليوم':x.i===1?'غداً':DN[wdOf(x.d)];
  return{text:day+' '+t12(x.m)+(x.skipped?' (ملغى)':''),sub:x.skipped?'ألغيت هذا المنبه. لن يرن.':'لا يتوقف حتى تصوّر الماء على وجهك ورأسك وسجادة الصلاة.',canCancel:true,skipped:x.skipped};
}
ACT.almSkip=()=>{const x=nextAlarm();if(!x)return;cfg.alarm.skip=cfg.alarm.skip===x.d?'':x.d;saveCfg();toast(cfg.alarm.skip?'أُلغي منبه '+(x.i===0?'اليوم':x.i===1?'الغد':DN[wdOf(x.d)]):'أُعيد تفعيل المنبه');renderSec(curSec)};

/* ----- الصوت ----- */
function sirenStop(){clearInterval(AL.siv);AL.siv=null;try{if(AL.osc){AL.osc.stop();AL.osc.disconnect()}}catch(e){}AL.osc=null;try{navigator.vibrate&&navigator.vibrate(0)}catch(e){}}
function sirenStart(){
  sirenStop();let a;try{ctx();a=ac;if(a.state==='suspended')a.resume()}catch(e){return}
  const s=cfg.alarm.sound,vol=cfg.alarm.vol/100*.55,o=a.createOscillator(),g=a.createGain();o.type=s==='pulse'?'sine':'square';g.gain.value=0;o.connect(g);g.connect(a.destination);o.start();AL.osc=o;
  let i=0;AL.siv=setInterval(()=>{i++;const t=a.currentTime;
    if(s==='siren'){o.frequency.setTargetAtTime(i%2?1100:700,t,.05);g.gain.setTargetAtTime(vol,t,.02)}
    else if(s==='beeps'){o.frequency.value=1000;g.gain.setTargetAtTime(i%4<2?vol:0,t,.01)}
    else{o.frequency.value=480+(i%8)*45;g.gain.setTargetAtTime(vol,t,.02)}
    if(cfg.alarm.vib&&navigator.vibrate&&!AL.test)navigator.vibrate([300,100,300]);
  },400);
}
function notify(title,body,tag){
  try{if(window.Notification&&Notification.permission==='granted'){const o={body:body,tag:tag||'ab',icon:'icon-192.png',vibrate:[200,100,200],requireInteraction:true};
    if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.ready.then(r=>r.showNotification(title,o));else new Notification(title,o)}}catch(e){}
}
/* ----- الكاميرا والتحليل ----- */
async function camStart(facing,vid,msg){
  camStop();AL.nocam=false;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){AL.nocam=true;msg('الكاميرا المباشرة غير متاحة هنا. اضغط «التقط الصورة» لفتح كاميرا الهاتف.');return false}
  try{
    try{AL.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:720},height:{ideal:720}},audio:false})}
    catch(e1){if(e1&&(e1.name==='NotAllowedError'||e1.name==='SecurityError'))throw e1;AL.stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false})}
    vid.setAttribute('playsinline','');vid.muted=true;vid.srcObject=AL.stream;await vid.play().catch(()=>{});return true;
  }catch(e){AL.nocam=true;msg('لم تعمل الكاميرا المباشرة. اضغط «التقط الصورة» لفتح كاميرا الهاتف، أو اسمح للكاميرا من إعدادات المتصفح ثم «إعادة الكاميرا».');return false}
}
function camStop(){try{if(AL.stream)AL.stream.getTracks().forEach(t=>t.stop())}catch(e){}AL.stream=null}
function sampleImg(src,w,h){w=w||96;h=h||72;const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(src,0,0,w,h);return x.getImageData(0,0,w,h)}
function imgStats(img){
  const d=img.data,n=d.length/4,w=img.width,h=img.height,hist=new Array(64).fill(0),L=new Float32Array(n);
  let skin=0,hl=0,dark=0,lum=0,tx=0;
  for(let i=0;i<n;i++){
    const r=d[i*4],g=d[i*4+1],b=d[i*4+2],y=.299*r+.587*g+.114*b,cb=128-.1687*r-.3313*g+.5*b,cr=128+.5*r-.4187*g-.0813*b,mx=Math.max(r,g,b),mn=Math.min(r,g,b),s=mx?(mx-mn)/mx:0;
    if(cr>133&&cr<177&&cb>77&&cb<130&&y>45)skin++;
    if(mx>225&&s<.24)hl++;
    if(y<55)dark++;
    lum+=y;hist[(r>>6)*16+(g>>6)*4+(b>>6)]++;L[i]=y;
  }
  for(let j=0;j<h;j++)for(let i=1;i<w;i++)tx+=Math.abs(L[j*w+i]-L[j*w+i-1]);
  const sig=[];for(let by=0;by<12;by++)for(let bx=0;bx<16;bx++){let s=0,c=0;for(let j=by*6;j<by*6+6&&j<h;j++)for(let i=bx*6;i<bx*6+6&&i<w;i++){s+=L[j*w+i];c++}sig.push(s/Math.max(1,c))}
  return{skin:skin/n,hl:hl/n,dark:dark/n,lum:lum/n,tex:tx/(n-h),hist:hist.map(v=>v/n),sig:sig};
}
const sigDiff=(a,b)=>{let s=0;for(let i=0;i<a.length;i++)s+=Math.abs(a[i]-b[i]);return s/a.length};
const histInter=(a,b)=>{let s=0;for(let i=0;i<a.length;i++)s+=Math.min(a[i],b[i]);return s};
const SENS={low:{hl:.006,m:.34},mid:{hl:.014,m:.48},high:{hl:.028,m:.6}};
function judge(stepId,s){
  const T=SENS[cfg.alarm.sens]||SENS.mid;
  if(s.lum<28)return{ok:false,msg:'الصورة مظلمة جداً. أضئ المكان وحاول.'};
  if(s.tex<1.4)return{ok:false,msg:'الصورة غير واضحة. ثبّت الهاتف وحاول.'};
  if(stepId==='face'){
    if(s.skin<.12)return{ok:false,msg:'لا يظهر وجهك بوضوح. قرّب الكاميرا منه.'};
    if(s.hl<T.hl)return{ok:false,msg:'لا يظهر لمعان الماء على بشرتك. بلّل وجهك جيداً وواجه الضوء.'};
    return{ok:true};
  }
  if(stepId==='head'){
    if(s.skin<.03&&s.dark<.18)return{ok:false,msg:'لا يظهر رأسك وشعرك. اجعله في وسط الصورة.'};
    if(s.hl<T.hl*.7)return{ok:false,msg:'لا يظهر البلل على رأسك. بلّل شعرك أكثر وحاول.'};
    const f=AL.sigs[0];if(f&&sigDiff(f,s.sig)<5)return{ok:false,msg:'الصورة مطابقة لصورة الوجه. غيّر وضعية الكاميرا لتُظهر رأسك.'};
    return{ok:true};
  }
  if(s.skin>.35)return{ok:false,msg:'يظهر وجهك أكثر من اللازم. وجّه الكاميرا الخلفية نحو سجادة الصلاة.'};
  if(s.tex<2.2)return{ok:false,msg:'لا أرى سجادة. قرّب الكاميرا منها.'};
  const rug=cfg.alarm.rug||[];
  if(rug.length){let best=0;rug.forEach(h=>{best=Math.max(best,histInter(h,s.hist))});if(best<T.m)return{ok:false,msg:'هذه ليست سجادتك المسجلة (تطابق '+Math.round(best*100)+'٪). صوّر سجادة الصلاة نفسها.'}}
  return{ok:true,note:rug.length?'':'لم تسجّل سجادتك بعد، فالتحقق عام.'};
}
/* ----- واجهة الرنين ----- */
const AR_HTML='<div class="ar-in"><div class="ar-t" id="ar-time">--:--</div><div class="ar-s" id="ar-title"></div><div class="ar-dots" id="ar-dots"></div><div class="ar-cam"><video id="ar-v" playsinline muted autoplay></video><div class="ar-flash" id="ar-flash"></div></div><div class="ar-msg" id="ar-msg"></div><div class="row" style="justify-content:center"><button class="btn big" id="ar-shot" data-a="arshot">التقط الصورة</button><button class="btn g" data-a="arretry">إعادة الكاميرا</button></div><input type="file" accept="image/*" capture="user" id="ar-file" data-c="arfile" hidden><div class="row" style="justify-content:center;margin-top:12px"><button class="btn g s" data-a="arsos" id="ar-sos">طوارئ: لا تعمل الكاميرا</button><button class="btn g s" data-a="arstop" id="ar-stop" hidden>إنهاء الاختبار</button></div></div>';
function ensureOverlay(){
  let el=$('#alarm');if(el)return el;
  el=document.createElement('div');el.id='alarm';el.hidden=true;el.setAttribute('role','alertdialog');el.setAttribute('aria-modal','true');
  document.body.appendChild(el);
  el.addEventListener('pointerdown',()=>{try{if(ac&&ac.state==='suspended')ac.resume()}catch(e){}});
  return el;
}
function arMsg(t,bad){const m=$('#ar-msg');if(m){m.textContent=t;m.className='ar-msg'+(bad?' bad':'')}}
function arStep(i){
  AL.step=i;const s=ASTEPS[i];
  $('#ar-title').textContent=s.t;$('#ar-dots').innerHTML=ASTEPS.map((x,j)=>'<i class="'+(j<i?'ok':j===i?'on':'')+'"></i>').join('');
  arMsg(s.h);$('#ar-v').classList.toggle('mir',s.cam==='user');
  camStart(s.cam,$('#ar-v'),t=>arMsg(t,true));
}
function startRing(k,test){
  if(AL.ring)return;AL.ring=true;AL.k=k;AL.test=!!test;AL.t0=Date.now();AL.sigs=[];
  const el=ensureOverlay();el.innerHTML=AR_HTML;el.removeAttribute('data-fin');el.hidden=false;document.body.classList.add('mo');
  $('#ar-stop').hidden=!test;$('#ar-sos').hidden=!!test&&false;
  if(!test){try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(l=>{AL.wl=l}).catch(()=>{})}catch(e){}notify('حان وقت الاستيقاظ','افتح التطبيق وصوّر الماء والسجادة لإيقاف المنبه.','alarm')}
  if(FT&&FT.run){try{focusPause()}catch(e){}}
  closeSheet();sirenStart();arStep(0);arTick();
}
function arTick(){const t=$('#ar-time');if(t){const n=new Date();t.textContent=pad(n.getHours()%12||12)+':'+pad(n.getMinutes())+' '+(n.getHours()<12?'ص':'م')}}
ACT.arretry=()=>{arStep(AL.step)};
function arProcess(src){
  AL.busy=true;const fl=$('#ar-flash');fl.classList.add('on');setTimeout(()=>fl.classList.remove('on'),180);
  const s=imgStats(sampleImg(src)),sid=ASTEPS[AL.step].id,r=judge(sid,s);
  if(!r.ok){arMsg(r.msg,true);AL.busy=false;return}
  if(AL.step===0)AL.sigs[0]=s.sig;
  if(AL.step<2){arMsg('تمام. الخطوة التالية.');try{navigator.vibrate&&navigator.vibrate(0)}catch(e){}setTimeout(()=>{AL.busy=false;arStep(AL.step+1)},700)}
  else{AL.busy=false;ringDone(false)}
}
ACT.arshot=()=>{
  if(AL.busy)return;const v=$('#ar-v');
  if(AL.stream&&v.videoWidth){arProcess(v);return}
  if(AL.nocam){const f=$('#ar-file');f.setAttribute('capture',ASTEPS[AL.step].cam);f.value='';f.click();return}
  arMsg('الكاميرا لم تعمل بعد. اضغط «إعادة الكاميرا».',true);
};
CHG.arfile=t=>{
  const f=t.files&&t.files[0];if(!f)return;const u=URL.createObjectURL(f),im=new Image();
  im.onload=()=>{URL.revokeObjectURL(u);arProcess(im)};im.onerror=()=>arMsg('تعذر قراءة الصورة. حاول مرة أخرى.',true);im.src=u;
};
function ringDone(exit){
  camStop();sirenStop();try{if(AL.wl){AL.wl.release();AL.wl=null}}catch(e){}
  const test=AL.test,k=AL.k,took=Math.round((Date.now()-AL.t0)/1000);
  if(!test){const a=cfg.alarm.log;a[k]={done:1,at:Date.now(),took:took,exit:!!exit};
    const ks=Object.keys(a).sort();while(ks.length>60)delete a[ks.shift()];saveCfg()}
  AL.ring=false;
  const el=$('#alarm');
  el.innerHTML='<div class="ar-in"><div class="ar-t">'+(exit?'تم إيقاف المنبه':'أحسنت، أنت مستيقظ')+'</div><div class="ar-s">'+(exit?'مررت بمخرج الطوارئ. حاول غداً إكمال التصوير كاملاً.':(test?'نجح الاختبار.':'استغرقت '+Math.max(1,Math.round(took/60))+' دقيقة. ابدأ مذاكرتك الآن.'))+'</div><div style="margin:18px 0;font-size:1.3rem" dir="rtl">'+qh(rq())+'</div><div class="row" style="justify-content:center"><button class="btn big" data-a="arclose" data-go="'+(test?'alarm':'study')+'">'+(test?'إغلاق':'ابدأ اليوم')+'</button></div></div>';
  el.dataset.fin='1';
}
ACT.arclose=t=>{const el=$('#alarm');el.hidden=true;el.removeAttribute('data-fin');el.innerHTML='';document.body.classList.remove('mo');AL.ring=false;go(t.dataset.go||'home')};
ACT.arstop=()=>{camStop();sirenStop();AL.ring=false;const el=$('#alarm');el.hidden=true;document.body.classList.remove('mo');renderSec(curSec)};
ACT.arsos=()=>{
  const q=[0,1,2].map(()=>{const a=12+Math.floor(Math.random()*18),b=11+Math.floor(Math.random()*8);return[a,b]});
  AL.sos=q;
  const el=$('#alarm');el.querySelector('.ar-in').insertAdjacentHTML('beforeend','<div class="ar-sos" id="ar-sosbox"><b>مخرج الطوارئ</b><p class="sm">أجب عن المسائل الثلاث لإيقاف المنبه بدون كاميرا:</p>'+q.map((p,i)=>'<label class="row" style="justify-content:center">'+p[0]+' × '+p[1]+' = <input type="number" inputmode="numeric" id="sos'+i+'" style="width:90px"></label>').join('')+'<div class="row" style="justify-content:center;margin-top:8px"><button class="btn" data-a="arsosok">تأكيد</button><button class="btn g" data-a="arsosx">رجوع</button></div></div>');
  $('#ar-sos').hidden=true;
};
ACT.arsosx=()=>{const b=$('#ar-sosbox');if(b)b.remove();$('#ar-sos').hidden=false};
ACT.arsosok=()=>{
  const ok=AL.sos.every((p,i)=>parseInt($('#sos'+i).value,10)===p[0]*p[1]);
  if(ok)ringDone(true);else{toast('إجابة خاطئة. تحتاج أن تستيقظ تماماً.');ACT.arsosx()}
};
/* ----- وضع الليل ----- */
function nightOn(){
  let el=$('#night');if(!el){el=document.createElement('div');el.id='night';document.body.appendChild(el)}
  el.hidden=false;document.body.classList.add('mo');
  try{ctx();if(ac.state==='suspended')ac.resume()}catch(e){}
  try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(l=>{AL.nwl=l}).catch(()=>{})}catch(e){}
  nightTick();
}
function nightTick(){
  const el=$('#night');if(!el||el.hidden)return;const n=new Date(),i=alarmInfo();
  el.innerHTML='<div class="nt-t">'+pad(n.getHours()%12||12)+':'+pad(n.getMinutes())+'</div><div class="nt-s">المنبه: '+esc(i.text)+'</div><div class="nt-h">اترك الهاتف على الشاحن وهذه الشاشة مفتوحة. الصوت جاهز.</div><button class="btn g" data-a="nightoff">إيقاف وضع الليل</button>';
}
ACT.nightoff=()=>{const el=$('#night');el.hidden=true;document.body.classList.remove('mo');try{if(AL.nwl){AL.nwl.release();AL.nwl=null}}catch(e){}};
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&$('#night')&&!$('#night').hidden&&navigator.wakeLock)navigator.wakeLock.request('screen').then(l=>{AL.nwl=l}).catch(()=>{});
  alarmTick();
});
/* ----- قسم المنبه ----- */
RD.alarm=()=>{
  const a=cfg.alarm,i=alarmInfo(),lg=ago(7).map(d=>({d:d,x:a.log[d]}));
  const st1=card('منبه الصباح','<div class="row sp"><div><div class="big-n ac">'+esc(i.text)+'</div><div class="mut sm">'+esc(i.sub)+'</div></div><label class="sw"><input type="checkbox" data-c="almon" '+(a.on?'checked':'')+' aria-label="تشغيل المنبه"><i></i></label></div>'+
    '<div class="row" style="margin-top:12px">'+(i.canCancel?'<button class="btn d" data-a="almSkip">'+(i.skipped?'إعادة تفعيل المنبه':'إلغاء المنبه القادم')+'</button>':'')+'<button class="btn" data-a="almnight">وضع الليل (ينام الهاتف مفتوحاً)</button><button class="btn g" data-a="almtest">اختبار المنبه</button></div>',{cls:'full glow'});
  const set=card('الإعدادات','<div class="row"><label class="f">وقت الرنين<select data-c="almmode">'+opts([['auto','قبل بدء المذاكرة بمدة'],['fixed','وقت ثابت']],a.mode)+'</select></label>'+(a.mode==='auto'?'<label class="f">قبل المذاكرة بـ (دقيقة)<input type="number" min="0" max="90" value="'+a.lead+'" data-c="almlead" style="width:100px"></label>':'<label class="f">الساعة<input type="time" value="'+esc(a.fixed)+'" data-c="almfix"></label>')+'</div><div style="margin:10px 0 4px" class="sm mut">أيام التشغيل</div>'+dayChips(a.days,'almday')+
    '<div class="row" style="margin-top:12px"><label class="f">الصوت<select data-c="almsound">'+opts([['siren','صفارة'],['beeps','نبضات'],['pulse','نغمة صاعدة']],a.sound)+'</select></label><label class="f">الحساسية<select data-c="almsens">'+opts([['low','متساهلة'],['mid','متوسطة'],['high','صارمة']],a.sens)+'</select></label><label class="row sm"><input type="checkbox" data-c="almvib" '+(a.vib?'checked':'')+'> اهتزاز</label></div><label class="f" style="margin-top:8px">مستوى الصوت <input type="range" min="20" max="100" value="'+a.vol+'" data-c="almvol"></label>');
  const rug=card('سجادة الصلاة','<p class="mut sm">'+(a.rug.length?'سُجّلت '+a.rug.length+' صور لسجادتك. المنبه لن يقبل إلا ما يشبهها.':'لم تسجل سجادتك بعد. سجّلها ليكون التحقق أدق.')+'</p><div class="row"><button class="btn" data-a="rugenroll">'+(a.rug.length?'إعادة التسجيل':'تسجيل السجادة')+'</button>'+(a.rug.length?'<button class="btn g" data-a="rugclear">مسح</button>':'')+'</div>');
  const hist=card('آخر 7 أيام','<ul class="list">'+lg.map(r=>'<li><span class="t">'+(r.d===td()?'اليوم':DN[wdOf(r.d)])+'</span><span class="'+(r.x?(r.x.exit?'warn':'ok'):'mut')+'">'+(r.x?(r.x.exit?'خرجت بالطوارئ':'استيقظت · '+Math.max(1,Math.round(r.x.took/60))+' د'):'—')+'</span></li>').join('')+'</ul>');
  const hon=card('ما يجب أن تعرفه','<ul class="list"><li><span class="t"><b>يعمل والتطبيق مفتوح</b> والشاشة مستيقظة. المتصفحات لا تسمح بمنبه حقيقي والتطبيق مغلق. استخدم «وضع الليل» وأبقِ الهاتف على الشاحن.</span></li><li><span class="t"><b>التحقق تقريبي:</b> التطبيق يبحث عن لمعان الماء وملامح الوجه وشكل السجادة، ولا يرى الماء فعلاً. غالباً سيقبل صورة صحيحة ويرفض صورة عشوائية.</span></li><li><span class="t"><b>مخرج الطوارئ</b> موجود حتى لا تعلق إن تعطلت الكاميرا. يتطلب حل ثلاث مسائل ضرب.</span></li><li><span class="t">اجعل منبه هاتفك العادي احتياطاً في أول أسبوع.</span></li></ul>',{cls:'full'});
  return '<div class="grid">'+st1+set+rug+hist+hon+'</div>';
};
CHG.almon=t=>{cfg.alarm.on=t.checked;saveCfg();renderSec('alarm')};
CHG.almmode=t=>{cfg.alarm.mode=t.value;saveCfg();renderSec('alarm')};
CHG.almlead=t=>{cfg.alarm.lead=clamp(parseInt(t.value,10)||0,0,90);saveCfg();renderSec('alarm')};
CHG.almfix=t=>{cfg.alarm.fixed=t.value||'03:20';saveCfg();renderSec('alarm')};
ACT.almday=t=>{const w=+t.dataset.w,d=cfg.alarm.days,i=d.indexOf(w);if(i<0)d.push(w);else d.splice(i,1);saveCfg();renderSec('alarm')};
CHG.almsound=t=>{cfg.alarm.sound=t.value;saveCfg();sirenStart();setTimeout(sirenStop,1200)};
CHG.almsens=t=>{cfg.alarm.sens=t.value;saveCfg()};
CHG.almvib=t=>{cfg.alarm.vib=t.checked;saveCfg()};
CHG.almvol=t=>{cfg.alarm.vol=+t.value;saveCfg()};
ACT.almnight=nightOn;
ACT.almtest=()=>startRing(td(),true);
ACT.rugclear=()=>{cfg.alarm.rug=[];saveCfg();renderSec('alarm')};
ACT.rugenroll=()=>{
  AL.enroll=[];
  sheet('<h3>تسجيل سجادة الصلاة</h3><p class="mut sm">صوّرها 3 مرات من زوايا قريبة مختلفة وبالإضاءة المعتادة.</p><div class="ar-cam" style="max-width:340px;margin:auto"><video id="rg-v" playsinline muted autoplay></video></div><div class="ar-msg" id="rg-m">جارٍ تشغيل الكاميرا</div><div class="row" style="justify-content:center"><button class="btn" data-a="rugshot">التقاط (0/3)</button></div><input type="file" accept="image/*" capture="environment" id="rg-file" data-c="rgfile" hidden>',()=>{camStart('environment',$('#rg-v'),t=>{$('#rg-m').textContent=t})});
  $('#modal').addEventListener('click',function f(e){if(e.target.closest('[data-close]')||e.target===$('#modal')){camStop();$('#modal').removeEventListener('click',f)}});
};
function rugAdd(src){
  const s=imgStats(sampleImg(src)),t=$('[data-a=rugshot]');
  if(s.skin>.35){$('#rg-m').textContent='يظهر وجهك. وجّه الكاميرا للسجادة.';return}
  AL.enroll.push(s.hist);t.textContent='التقاط ('+AL.enroll.length+'/3)';$('#rg-m').textContent='تم التقاط صورة. غيّر الزاوية قليلاً.';
  if(AL.enroll.length>=3){cfg.alarm.rug=AL.enroll.slice();saveCfg();camStop();closeSheet();renderSec('alarm');toast('سُجّلت سجادة الصلاة')}
}
ACT.rugshot=()=>{
  const v=$('#rg-v');
  if(AL.stream&&v&&v.videoWidth){rugAdd(v);return}
  if(AL.nocam){const f=$('#rg-file');f.value='';f.click();return}
  $('#rg-m').textContent='الكاميرا لم تجهز بعد';
};
CHG.rgfile=t=>{const f=t.files&&t.files[0];if(!f)return;const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);rugAdd(im)};im.src=u};
/* ========== تنبيهات المهام ========== */
const SNZ=()=>st.get('snooze',{});
function taskDue(t){return t.due&&t.tm?new Date(t.due+'T'+t.tm+':00').getTime():0}
function showTaskAlarm(t){
  if($('#talarm'))return;
  const el=document.createElement('div');el.id='talarm';el.setAttribute('role','alertdialog');
  const late=Date.now()-taskDue(t)>60000;
  el.innerHTML='<div class="ta-in"><div class="ta-k">'+(late?'تأخرت المهمة':'تذكير بمهمة')+'</div><div class="ta-t">'+esc(t.t)+'</div><div class="mut">'+esc(t.c||'')+' · '+t12(pm(t.tm))+'</div><div class="row" style="justify-content:center;margin-top:16px"><button class="btn" data-a="tadone" data-id="'+t.id+'">أنجزتها</button><button class="btn g" data-a="tasnz" data-id="'+t.id+'">غفوة 5 د</button><button class="btn g" data-a="taclose">إغلاق</button></div></div>';
  document.body.appendChild(el);
  try{ctx();if(ac.state==='suspended')ac.resume();let n=0;const b=()=>{if(!$('#talarm')||n++>5)return;ping();setTimeout(b,900)};b()}catch(e){}
  try{navigator.vibrate&&navigator.vibrate([200,100,200,100,400])}catch(e){}
  notify('مهمة: '+t.t,t.tm?'الموعد '+t12(pm(t.tm)):'','task'+t.id);
}
ACT.tadone=t=>{completeTask(t.dataset.id);ACT.taclose();if(curSec==='tasks'||curSec==='home')renderSec(curSec)};
ACT.tasnz=t=>{const s=SNZ();s[t.dataset.id]=Date.now()+5*60000;st.set('snooze',s);ACT.taclose();toast('سأذكّرك بعد 5 دقائق')};
ACT.taclose=()=>{const e=$('#talarm');if(e)e.remove()};
function taskTick(){
  if($('#talarm'))return;const now=Date.now(),snz=SNZ();let ch=false;
  for(const t of TASKS()){
    if(t.done||t.al==null||t.al<0||!t.tm||!t.due)continue;
    const due=taskDue(t),key=t.due+'T'+t.tm,sn=snz[t.id];
    if(sn){if(now>=sn){delete snz[t.id];st.set('snooze',snz);showTaskAlarm(t);return}continue}
    if(t.fired===key)continue;
    if(now>=due-t.al*60000&&now<due+6*3600000){
      const all=TASKS(),x=all.find(y=>y.id===t.id);x.fired=key;saveTasks(all);showTaskAlarm(t);return;
    }
  }
}
function waterTick(){
  if(!cfg.remWater)return;const n=new Date(),h=n.getHours();if(h<9||h>21||n.getMinutes()!==0||h%2!==1||n.getSeconds()>1)return;
  const k=td(),tag=k+h;if(st.get('wrem','')===tag)return;st.set('wrem',tag);
  if(D.water(k)<cfg.water.goal){toast('اشرب كوب ماء');notify('وقت الماء','شربت '+D.water(k)+' من '+cfg.water.goal+' مل','water')}
}
/* ----- المحرك ----- */
let lastTick=0;
function alarmTick(){
  const now=Date.now();if(now-lastTick<900)return;lastTick=now;
  const a=cfg.alarm;
  if(AL.ring){arTick();}
  else if(a.on){
    const k=td(),w=wdOf(k),m=alarmMin(k),n=nowMin();
    if(a.days.includes(w)&&a.skip!==k&&!alarmDone(k)&&n>=m&&n<m+240)startRing(k,false);
    if(a.skip&&a.skip<k){a.skip='';saveCfg()}
  }
  nightTick();taskTick();waterTick();
}
function alarmInit(){ensureOverlay();setInterval(alarmTick,1000);alarmTick()}
