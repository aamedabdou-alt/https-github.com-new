/* ========== اختيار المرحلة، الترحيب، الكتب ========== */
const WIS={
  m:['ابدأ بأصغر خطوة ممكنة؛ الدماغ يتحمّس بعد أن يبدأ لا قبل أن يبدأ.','لا تقارن بدايتك بنهاية غيرك. قارن نفسك بنفسك أمس.','ما تفعله أول النهار يحدد شعورك بقية اليوم، فاجعله شيئاً تفخر به.','الثقة لا تأتي قبل الإنجاز، بل تتكوّن بعد كل مهمة صغيرة تنهيها.','أخطاؤك ليست حكماً عليك، هي معلومات تخبرك ماذا تُصلح.','تنفّس بعمق، رتّب أولوية واحدة، ثم ابدأ بها.','الاستمرارية الهادئة أقوى من الحماس المتقطع.','أنت أقدر مما تظن، وأقوى مما شعرت به في أصعب يوم مرّ عليك.','التعب مؤقت، أما أثر المجهود فيبقى.','اختر اليوم أن تكون أفضل قليلاً، لا أن تكون مثالياً.','حين يصعب الأمر قسّمه؛ الجبل يُصعد خطوة خطوة.','ابتسم لنفسك قبل أن تفتح الكتاب، فالمعاملة الطيبة تحسّن الأداء.'],
  d:['استراحة قصيرة لا تعني الفشل، بل هي جزء من الإنجاز.','حين تتشتت، عُد للتنفس ثم عُد للمهمة. لا تجلد نفسك.','التقدم البطيء تقدم. المهم ألا تتوقف.','قل لنفسك: أنا لا أعرف هذا بعد، ثم أضف: وسأتعلمه.','ركّز على ما تتحكم فيه: وقتك، وجهدك، وطريقتك.','الصعوبة علامة أنك تنمو، لا علامة أنك لا تصلح.','اطلب المساعدة حين تحتاجها؛ هذا ذكاء وليس ضعفاً.','قارن جهدك اليوم بجهدك الأمس، وستجد فرقاً يسعدك.','لا تنتظر شعور الرغبة؛ الانضباط يصنع الرغبة.','اكتب ما أنجزته اليوم، فالعين تحتاج أن ترى تقدمها.','ماء وحركة وهواء نقي، أبسط أدوات الذهن الصافي.','تذكّر لماذا بدأت، ولا تدع تعب اللحظة ينسيك هدفك.'],
  e:['أحسنت أنك أكملت يومك. الراحة الآن جزء من المذاكرة.','لا تحاسب نفسك على ما لم تنجزه؛ احتفِ بما أنجزته وخطّط لغدٍ أفضل.','النوم الكافي يثبّت ما تعلمته، فلا تفرّط فيه.','اكتب ثلاثة أشياء سارة حدثت اليوم؛ الامتنان يهدّئ العقل.','القلق يخف حين تحوله إلى خطة صغيرة مكتوبة.','أنت لست مقصراً لأنك تعبت، أنت إنسان.','اترك الشاشة قبل النوم بنصف ساعة، وسيشكرك عقلك صباحاً.','يوم صعب لا يعني حياة صعبة. غداً صفحة جديدة.','قدّر نفسك على الجهد، لا على النتيجة وحدها.','رتّب ثلاث مهام الغد الآن، لتنام وعقلك مطمئن.','تحدّث مع شخص تحبه؛ الدعم الاجتماعي يخفف الضغط.','سامح نفسك على أخطاء اليوم، وخذ منها درساً واحداً فقط.']
};
const periodOf=()=>{const h=cairoHour();return h>=5&&h<12?'m':h>=12&&h<17?'d':'e'};
function dayIdx(){const d=new Date();return Math.floor(d.getTime()/864e5)}
const wisdomNow=()=>{const p=periodOf(),a=WIS[p];return a[dayIdx()%a.length]};
const welcomeLine=()=>{const p=periodOf(),n=firstName();
  return {m:'صباح النور',d:'أهلاً بك',e:'مساء النور'}[p]+(n?' يا '+n:'')};
const userName=()=>profile().username||'';
function whoHTML(){const u=userName(),e=eduLabel();return (u?'<span dir="ltr">@'+esc(u)+'</span>':'')+(u&&e?' · ':'')+esc(e)}

/* ----- نموذج المرحلة ----- */
function eduForm(cur,onSave,box){
  cur=Object.assign({stage:'prim',grade:1,track:''},cur||{});
  const draw=()=>{
    const E=EDU[cur.stage],nt=eduNeedsTrack(cur.stage,+cur.grade);
    if(!E.g.includes(+cur.grade))cur.grade=E.g[0];
    if(!nt)cur.track='';else if(!TRACKS[cur.stage][cur.track])cur.track=Object.keys(TRACKS[cur.stage])[0];
    box.innerHTML='<label class="f">المرحلة<select id="ed-s">'+Object.keys(EDU).map(k=>'<option value="'+k+'"'+(k===cur.stage?' selected':'')+'>'+EDU[k].n+'</option>').join('')+'</select></label>'+
    '<label class="f">الصف<select id="ed-g">'+E.g.map(g=>'<option value="'+g+'"'+(g==cur.grade?' selected':'')+'>'+E.gn(g)+'</option>').join('')+'</select></label>'+
    (nt?'<label class="f">'+(cur.stage==='bac'?'المسار':'الشعبة')+'<select id="ed-t">'+Object.keys(TRACKS[cur.stage]).map(k=>'<option value="'+k+'"'+(k===cur.track?' selected':'')+'>'+TRACKS[cur.stage][k]+'</option>').join('')+'</select></label>':'')+
    '<div class="mut sm" style="margin:6px 0">المواد: '+eduSubjects(cur).map(s=>s.n).join(' · ')+'</div>'+
    '<button class="btn big" id="ed-ok">حفظ</button>';
    box.querySelector('#ed-s').onchange=e=>{cur.stage=e.target.value;cur.grade=EDU[cur.stage].g[0];cur.track='';draw()};
    box.querySelector('#ed-g').onchange=e=>{cur.grade=+e.target.value;draw()};
    const t=box.querySelector('#ed-t');if(t)t.onchange=e=>{cur.track=e.target.value;draw()};
    box.querySelector('#ed-ok').onclick=()=>onSave({stage:cur.stage,grade:+cur.grade,track:cur.track,off:[]});
  };
  draw();
}
function saveEdu(e){const p=profile();const same=p.edu&&p.edu.stage===e.stage&&+p.edu.grade===+e.grade&&p.edu.track===e.track;p.edu=same?Object.assign(e,{off:p.edu.off||[]}):e;st.set('profile',p);if(!same){cfg.plan={};saveCfg()}}
function askStage(){return new Promise(res=>{
  document.body.classList.add('lock');
  const el=document.createElement('div');el.id='auth';
  el.innerHTML='<div class="auth-in"><div class="auth-logo"></div><h1>مرحلتك الدراسية</h1><p class="mut">اختر مرحلتك لنضيف موادك وكتبك تلقائياً.</p><div id="ed-box" style="display:flex;flex-direction:column;gap:10px;text-align:right"></div></div>';
  document.body.appendChild(el);
  eduForm(null,e=>{saveEdu(e);el.remove();document.body.classList.remove('lock');res()},el.querySelector('#ed-box'));
})}
ACT.edusheet=()=>{
  sheet('<h3>المرحلة الدراسية</h3><div id="ed-box" style="display:flex;flex-direction:column;gap:10px"></div>',s=>{
    eduForm(eduOf(),e=>{saveEdu(e);closeSheet();toast('تم تحديث موادك');renderSec(curSec)},s.querySelector('#ed-box'))});
};
ACT.subsheet=()=>{
  const e=eduOf();if(!e){ACT.edusheet();return}
  const all=eduSubjects(e),off=e.off||[];
  sheet('<h3>موادي</h3><p class="mut sm">أخفِ ما لا تدرسه.</p><div class="chips" style="flex-wrap:wrap">'+all.map(s=>'<button class="chip'+(off.includes(s.k)?'':' on')+'" data-a="subtog" data-k="'+s.k+'">'+esc(s.n)+'</button>').join('')+'</div>');
};
ACT.subtog=t=>{const p=profile();if(!p.edu)return;const o=p.edu.off||[],k=t.dataset.k,i=o.indexOf(k);if(i<0)o.push(k);else o.splice(i,1);p.edu.off=o;st.set('profile',p);t.classList.toggle('on');cfg.plan={};saveCfg()};

/* ----- الترحيب ----- */
function showWelcome(){
  const key=td()+periodOf();let seen='';try{seen=st.get('wsh','')}catch(e){}
  if(seen===key)return;st.set('wsh',key);
  const u=userName();
  sheet('<div style="text-align:center;padding:6px 4px"><div class="mut sm">'+({m:'صباح الخير',d:'نهارك سعيد',e:'مساء الخير'}[periodOf()])+'</div><h2 style="margin:6px 0 4px">'+esc(me()||'أهلاً بك')+'</h2>'+
   (u||eduLabel()?'<div class="mut sm">'+whoHTML()+'</div>':'')+
   '<p style="margin:16px 0 4px;font-size:1.1rem;line-height:1.9">'+esc(wisdomNow())+'</p><button class="btn big" data-close style="margin-top:12px">لنبدأ</button></div>');
}

/* ----- الكتب ----- */
const bookKey=s=>s.k+'|'+eduLabel();
function booksCard(){
  const e=eduOf();if(!e)return '';
  const rows=mySubs().map(s=>{
    const f=libItems.find(x=>x.bk===bookKey(s));
    return '<li style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 0"><i style="width:10px;height:10px;border-radius:50%;background:'+s.c+'"></i><span class="t" style="flex:1;min-width:140px">'+esc(bookTitle(s))+'</span>'+
    (f?'<button class="btn s" data-a="libopen" data-id="'+f.id+'">فتح</button>':'<a class="btn g s" href="'+bookSearch(s)+'" target="_blank" rel="noopener">بحث</a>')+
    '<label class="btn g s">'+(f?'استبدال':'رفع')+'<input type="file" accept="application/pdf,.pdf" hidden data-c="bookup" data-k="'+s.k+'"></label></li>'}).join('');
  return '<div class="card" style="margin-bottom:12px"><h3>كتب مرحلتي</h3><p class="mut sm">'+esc(eduLabel())+'. «بحث» يفتح نتائج عن كتاب الوزارة الرسمي، وبعد تنزيله ارفعه هنا ليبقى معك بلا إنترنت. الكتب على جهازك فقط.</p><ul class="list">'+rows+'</ul><div class="row" style="margin-top:8px"><a class="btn g s" href="https://moe.gov.eg" target="_blank" rel="noopener">موقع الوزارة</a><a class="btn g s" href="https://study.ekb.eg" target="_blank" rel="noopener">بنك المعرفة المصري</a></div></div>';
}
CHG.bookup=async t=>{
  const f=t.files[0];if(!f)return;const s=mySubs().find(x=>x.k===t.dataset.k);if(!s)return;
  try{
    const old=libItems.find(x=>x.bk===bookKey(s));if(old)await libTx('readwrite',x=>x.delete(+old.id));
    await libTx('readwrite',x=>x.add({name:bookTitle(s)+'.pdf',type:f.type,size:f.size,cat:'كتب',at:Date.now(),blob:f,bk:bookKey(s)}));
    libItems=[];renderSec('lib');toast('أُضيف الكتاب');
  }catch(err){toast('تعذر حفظ الكتاب')}
  t.value='';
};
