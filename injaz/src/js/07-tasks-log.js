/* ========== المهام ========== */
const TASKS=()=>st.get('tasks',[]),saveTasks=a=>st.set('tasks',a);
const TCATS=['دراسة','برمجة','عربي','تاريخ','إنجليزي','تمارين','أكل','شخصي','قراءة','أخرى'];
const PRI={1:['عالية','#e8806a'],2:['متوسطة','#e3b866'],3:['منخفضة','#7fb29a']};
const LEADS=[[-1,'بدون تنبيه'],[0,'عند الموعد'],[5,'قبلها بـ 5 د'],[10,'قبلها بـ 10 د'],[30,'قبلها بـ 30 د'],[60,'قبلها بساعة']];
let tFilter='today',tSort='pri',tQ='';
const isLate=t=>{const k=td();return !t.done&&t.due&&(t.due<k||(t.due===k&&t.tm&&pm(t.tm)<nowMin()))};
function taskToday(){const k=td();return{done:D.tdone(k),open:TASKS().filter(t=>!t.done&&t.due&&t.due<=k).length}}
function taskList(f,sortBy,q){
  const k=td();let a=TASKS();
  if(f==='today')a=a.filter(t=>!t.done&&t.due&&t.due<=k);
  else if(f==='up')a=a.filter(t=>!t.done&&t.due&&t.due>k);
  else if(f==='nodate')a=a.filter(t=>!t.done&&!t.due);
  else if(f==='late')a=a.filter(isLate);
  else if(f==='done')a=a.filter(t=>t.done);
  if(q)a=a.filter(t=>(t.t+' '+(t.n||'')).includes(q));
  const key=t=>(t.due||'9999')+' '+(t.tm||'99:99');
  if(sortBy==='due')a.sort((x,y)=>key(x).localeCompare(key(y)));
  else if(sortBy==='new')a.sort((x,y)=>y.at-x.at);
  else a.sort((x,y)=>(x.p-y.p)||key(x).localeCompare(key(y)));
  return a;
}
function dueLabel(t){
  if(!t.due)return '';const k=td();
  const d=t.due===k?'اليوم':t.due===addDays(k,1)?'غداً':t.due===addDays(k,-1)?'أمس':DN[wdOf(t.due)]+' '+t.due.slice(8)+'/'+t.due.slice(5,7);
  return d+(t.tm?' · '+t12(pm(t.tm)):'');
}
function taskBadge(t){
  const p=PRI[t.p]||PRI[2];
  return '<span class="pill c" style="--c:'+p[1]+'">'+p[0]+'</span>'+(t.due?'<span class="pill'+(isLate(t)?' c" style="--c:#e8806a':'')+'">'+dueLabel(t)+'</span>':'')+(t.al!=null&&t.al>=0&&t.tm?'<span class="pill">منبه</span>':'');
}
function completeTask(id){
  const a=TASKS(),t=a.find(x=>x.id===id);if(!t)return;const k=td();
  const dd=st.get('tdone',{});dd[k]=(dd[k]||0)+1;st.set('tdone',dd);
  if(t.rep&&t.rep!=='none'){const step=t.rep==='daily'?1:7;let d=addDays(t.due&&t.due>k?t.due:k,step);t.due=d;(t.steps||[]).forEach(s=>{s.d=false});t.fired=''}
  else{t.done=true;t.doneAt=k}
  saveTasks(a);
}
function uncompleteTask(id){
  const a=TASKS(),t=a.find(x=>x.id===id);if(!t)return;t.done=false;t.doneAt='';saveTasks(a);
  const dd=st.get('tdone',{}),k=td();if(dd[k]>0){dd[k]--;st.set('tdone',dd)}
}
RD.tasks=()=>{
  const k=td(),all=TASKS(),T0=taskToday(),list=taskList(tFilter,tSort,tQ);
  const cnt=f=>taskList(f).length;
  const wkDone=sum(ago(7).map(d=>D.tdone(d)));
  const filters=[['today','اليوم'],['late','متأخرة'],['up','القادمة'],['nodate','بلا موعد'],['done','منجزة'],['all','الكل']];
  const quick=card('مهمة جديدة','<div class="col"><input type="text" id="tq" placeholder="ماذا تريد أن تنجز؟" data-en="#tqadd">'+
    '<div class="row"><label class="f">اليوم<input type="date" id="tqd" value="'+k+'"></label><label class="f">الساعة<input type="time" id="tqt"></label><label class="f">المنبه<select id="tql">'+opts(LEADS,0)+'</select></label></div>'+
    '<div class="row"><button class="btn" id="tqadd" data-a="tquick">أضف المهمة</button><button class="btn g" data-a="tform">خيارات أكثر</button></div>'+
    '<div class="chips">'+['مراجعة درس','حل مسائل','تلخيص فصل','قراءة 30 صفحة','تمرين الجيم','كتابة ملخص'].map(x=>chip(0,'data-a="ttpl" data-t="'+x+'"',x)).join('')+'</div>'+
    '<div class="mut sm">المنبه يرنّ ويعرض لك المهمة عند موعدها بشرط أن يكون التطبيق مفتوحاً.</div></div>');
  const stats=card('نظرة سريعة','<div class="tiles"><div class="tile"><b>'+T0.done+'/'+(T0.done+T0.open)+'</b><span>مهام اليوم</span></div><div class="tile"><b>'+wkDone+'</b><span>أُنجزت هذا الأسبوع</span></div><div class="tile"><b class="'+(cnt('late')?'bad':'')+'">'+cnt('late')+'</b><span>متأخرة</span></div><div class="tile"><b>'+cnt('up')+'</b><span>قادمة</span></div></div>'+bar(T0.done+T0.open?T0.done/(T0.done+T0.open):0));
  const rows=list.map(t=>{
    const steps=(t.steps||[]),sd=steps.filter(s=>s.d).length;
    return '<li style="align-items:flex-start;flex-wrap:wrap" class="'+(t.done?'done':'')+'"><input type="checkbox" data-c="tchk" data-id="'+t.id+'" '+(t.done?'checked':'')+' aria-label="تم"><div class="t"><div>'+esc(t.t)+'</div><div class="row" style="gap:5px;margin-top:3px">'+taskBadge(t)+'<span class="pill">'+esc(t.c||'أخرى')+'</span>'+(t.rep&&t.rep!=='none'?'<span class="pill">'+(t.rep==='daily'?'يومي':'أسبوعي')+'</span>':'')+(steps.length?'<span class="pill">'+sd+'/'+steps.length+' خطوات</span>':'')+'</div>'+
      (t.n?'<div class="mut sm" style="margin-top:3px;white-space:pre-wrap">'+esc(t.n)+'</div>':'')+
      (steps.length&&!t.done?'<div style="margin-top:4px">'+steps.map((s,i)=>'<label class="row sm" style="gap:8px;margin:2px 0"><input type="checkbox" style="width:18px;height:18px" data-c="tstep" data-id="'+t.id+'" data-i="'+i+'" '+(s.d?'checked':'')+'>'+esc(s.x)+'</label>').join('')+'</div>':'')+'</div>'+
      '<div class="row" style="gap:2px"><button class="btn g s" data-a="tform" data-id="'+t.id+'">تعديل</button><button class="x" data-a="tdel" data-id="'+t.id+'" aria-label="حذف">×</button></div></li>';
  }).join('');
  const lst=card('قائمة المهام','<div class="chips" style="margin-bottom:10px">'+filters.map(f=>chip(tFilter===f[0],'data-a="tfilter" data-f="'+f[0]+'"',f[1]+(f[0]!=='all'&&f[0]!=='done'&&cnt(f[0])?' ('+cnt(f[0])+')':''))).join('')+'</div>'+
    '<div class="row" style="margin-bottom:6px"><input type="search" class="grow" placeholder="بحث في المهام" data-i="tsearch" value="'+esc(tQ)+'"><select data-c="tsort" aria-label="الترتيب">'+opts([['pri','الأهم أولاً'],['due','حسب الموعد'],['new','الأحدث']],tSort)+'</select></div>'+
    (list.length?'<ul class="list">'+rows+'</ul>':'<div class="empty">'+(all.length?'لا مهام في هذا التصنيف':'لا مهام بعد. أضف أول مهمة من الأعلى.')+'</div>')+
    (all.some(t=>t.done)?'<button class="btn g s" data-a="tclear">حذف المنجزة</button>':''),{cls:'full'});
  return '<div class="grid">'+quick+stats+lst+'</div>';
};
INP.tsearch=t=>{tQ=t.value.trim();const p=t.selectionStart;renderSec('tasks');const n=$('[data-i=tsearch]');if(n){n.focus();try{n.setSelectionRange(p,p)}catch(e){}}};
CHG.tsort=t=>{tSort=t.value;renderSec('tasks')};
ACT.tfilter=t=>{tFilter=t.dataset.f;renderSec('tasks')};
ACT.ttpl=t=>{const i=$('#tq');i.value=t.dataset.t;i.focus()};
function newTask(o){return Object.assign({id:uid(),t:'',c:'دراسة',p:2,due:'',tm:'',al:-1,rep:'none',n:'',steps:[],done:false,at:Date.now(),fired:''},o)}
ACT.tquick=()=>{
  const v=$('#tq').value.trim();if(!v){toast('اكتب اسم المهمة أولاً');return}
  const tm=$('#tqt').value,al=parseInt($('#tql').value,10);
  const a=TASKS();a.push(newTask({t:v,due:$('#tqd').value||'',tm:tm,al:tm?al:-1}));saveTasks(a);
  toast(tm&&al>=0?'أُضيفت المهمة وضُبط المنبه':'أُضيفت المهمة');tFilter=($('#tqd').value&&$('#tqd').value>td())?'up':'today';renderSec('tasks');
};
CHG.tchk=t=>{if(t.checked){completeTask(t.dataset.id);toast('أحسنت')}else uncompleteTask(t.dataset.id);renderSec(curSec)};
CHG.tstep=t=>{const a=TASKS(),x=a.find(y=>y.id===t.dataset.id);if(x){x.steps[+t.dataset.i].d=t.checked;saveTasks(a);renderSec('tasks')}};
ACT.tdel=t=>ask('حذف هذه المهمة؟','حذف',()=>{saveTasks(TASKS().filter(x=>x.id!==t.dataset.id));renderSec('tasks')},true);
ACT.tclear=()=>{saveTasks(TASKS().filter(x=>!x.done));renderSec('tasks')};
ACT.tform=t=>{
  const id=t&&t.dataset?t.dataset.id:'',x=id?TASKS().find(y=>y.id===id):newTask({due:td()});if(!x)return;
  sheet('<h3>'+(id?'تعديل المهمة':'مهمة جديدة')+'</h3><div class="col">'+
    '<label class="f">العنوان<input type="text" id="tf_t" value="'+esc(x.t)+'"></label>'+
    '<div class="row"><label class="f">التصنيف<select id="tf_c">'+opts(TCATS,x.c)+'</select></label><label class="f">الأهمية<select id="tf_p">'+opts([[1,'عالية'],[2,'متوسطة'],[3,'منخفضة']],x.p)+'</select></label><label class="f">التكرار<select id="tf_r">'+opts([['none','مرة واحدة'],['daily','كل يوم'],['weekly','كل أسبوع']],x.rep)+'</select></label></div>'+
    '<div class="row"><label class="f">التاريخ<input type="date" id="tf_d" value="'+esc(x.due)+'"></label><label class="f">الساعة<input type="time" id="tf_m" value="'+esc(x.tm)+'"></label><label class="f">المنبه<select id="tf_a">'+opts(LEADS,x.al==null?-1:x.al)+'</select></label></div>'+
    '<label class="f">خطوات فرعية (سطر لكل خطوة)<textarea id="tf_s" rows="3">'+esc((x.steps||[]).map(s=>s.x).join('\n'))+'</textarea></label>'+
    '<label class="f">ملاحظات<textarea id="tf_n" rows="2">'+esc(x.n||'')+'</textarea></label>'+
    '<div class="row"><button class="btn" data-a="tsave" data-id="'+esc(id)+'">حفظ</button><button class="btn g" data-close>إلغاء</button></div></div>');
};
ACT.tsave=t=>{
  const ti=$('#tf_t').value.trim();if(!ti){toast('اكتب عنوان المهمة');return}
  const a=TASKS(),id=t.dataset.id;let x=id?a.find(y=>y.id===id):null;const isNew=!x;if(isNew)x=newTask();
  const old=(x.steps||[]),lines=$('#tf_s').value.split('\n').map(s=>s.trim()).filter(Boolean);
  const tm=$('#tf_m').value;
  Object.assign(x,{t:ti,c:$('#tf_c').value,p:+$('#tf_p').value,rep:$('#tf_r').value,due:$('#tf_d').value,tm:tm,al:tm?parseInt($('#tf_a').value,10):-1,n:$('#tf_n').value.trim(),fired:'',steps:lines.map(l=>({x:l,d:!!(old.find(o=>o.x===l)||{}).d}))});
  if(isNew)a.push(x);saveTasks(a);closeSheet();renderSec(curSec);toast('تم الحفظ');
};

/* ========== السجل اليومي ========== */
let logDay=td();
const MOODS=[['ممتاز','#7fb29a'],['جيد','#b7d68b'],['عادي','#e3b866'],['متعب','#ff9f6b'],['سيئ','#e8806a']];
const LOGS=()=>st.get('log',{});
function logSet(k,f,v){const a=LOGS();a[k]=a[k]||{};a[k][f]=v;st.set('log',a)}
RD.log=()=>{
  const k=logDay,e=LOGS()[k]||{},s=dayStats(k),t0=td();
  const strip=ago(8).map(d=>'<button class="chip'+(d===k?' on':'')+'" data-a="logday" data-d="'+d+'"><span>'+(d===t0?'اليوم':DN[wdOf(d)])+'</span><br><small>'+d.slice(8)+'/'+d.slice(5,7)+(LOGS()[d]?' ●':'')+'</small></button>').join('');
  const tiles='<div class="tiles"><div class="tile"><b>'+dur(s.study)+'</b><span>مذاكرة</span></div><div class="tile"><b>'+dur(s.read)+'</b><span>قراءة</span></div><div class="tile"><b>'+(s.water/1000).toFixed(1)+' ل</b><span>ماء</span></div><div class="tile"><b>'+s.kcal+'</b><span>سعرة</span></div><div class="tile"><b>'+(s.gym?'نعم':'لا')+'</b><span>تمرين</span></div><div class="tile"><b>'+s.tasks+'</b><span>مهام منجزة</span></div><div class="tile"><b>'+(s.sleep?(s.sleep/60).toFixed(1)+' س':'—')+'</b><span>نوم</span></div></div>';
  const rate=(f,l)=>'<label class="f">'+l+': <b class="ac">'+(e[f]||3)+'/5</b><input type="range" min="1" max="5" value="'+(e[f]||3)+'" data-i="logr" data-f="'+f+'"></label>';
  const ta=(f,l,ph)=>'<label class="f">'+l+'<textarea rows="3" data-i="logt" data-f="'+f+'" placeholder="'+ph+'">'+esc(e[f]||'')+'</textarea></label>';
  const form=card('سجل '+(k===t0?'اليوم':ymd(k)),'<div class="dl" style="margin-bottom:12px">'+strip+'</div>'+tiles+
    '<div class="b" style="margin:14px 0 6px">كيف كان يومك؟</div><div class="mood">'+MOODS.map((m,i)=>'<button style="--c:'+m[1]+'" class="'+(e.mood===i+1?'on':'')+'" data-a="logmood" data-v="'+(i+1)+'">'+m[0]+'</button>').join('')+'</div>'+
    '<div class="grid w2" style="margin:10px 0">'+rate('foc','التركيز')+rate('en','الطاقة')+rate('com','الالتزام')+'</div>'+
    '<div class="col">'+ta('w3','ما الذي أنجزته؟','ثلاثة أشياء على الأقل')+ta('learn','ما الذي تعلمته؟','فكرة أو مهارة')+ta('gr','أشكر الله على...','')+ta('impr','ما الذي سأحسّنه غداً؟','خطوة واحدة محددة')+ta('free','ملاحظات حرة','')+'</div>'+
    '<div class="mut sm" id="logsv" style="margin-top:6px">يُحفظ تلقائياً أثناء الكتابة.</div>',{cls:'full'});
  const idn=card('هويتي','<div class="mut sm" style="margin-bottom:6px">فكرة من الرسالة: غيّر الشخص الذي تكونه، فتتبعه الأفعال.</div><label class="f">أنا من النوع الذي...<input type="text" data-i="ident" value="'+esc(st.get('ident',''))+'" placeholder="يذاكر من الفجر ويتمرن ويقرأ كل يوم"></label>');
  const hist=ago(14).map(d=>{const x=LOGS()[d]||{};return{l:d.slice(8),v:x.foc||0,c:x.mood?MOODS[x.mood-1][1]:null}});
  const chart=card('تركيزك آخر 14 يوماً',bars(hist,{max:5}));
  const past=Object.keys(LOGS()).sort().reverse().slice(0,8).filter(d=>d!==k).map(d=>{const x=LOGS()[d];return '<li data-a="logday" data-d="'+d+'" style="cursor:pointer"><span class="t"><b>'+ymd(d)+'</b><br><span class="mut sm">'+esc((x.w3||x.free||x.learn||'').slice(0,70))+'</span></span>'+(x.mood?'<span class="pill c" style="--c:'+MOODS[x.mood-1][1]+'">'+MOODS[x.mood-1][0]+'</span>':'')+'</li>'}).join('');
  return '<div class="grid">'+form+idn+chart+(past?card('أيام سابقة','<ul class="list">'+past+'</ul>'):'')+'</div>';
};
ACT.logday=t=>{logDay=t.dataset.d;renderSec('log')};
ACT.logmood=t=>{logSet(logDay,'mood',+t.dataset.v);renderSec('log')};
let logTm=null;
function logSaved(){const s=$('#logsv');if(s){s.textContent='تم الحفظ';clearTimeout(logTm);logTm=setTimeout(()=>{const z=$('#logsv');if(z)z.textContent='يُحفظ تلقائياً أثناء الكتابة.'},1500)}}
INP.logt=t=>{logSet(logDay,t.dataset.f,t.value);logSaved()};
INP.logr=t=>{logSet(logDay,t.dataset.f,+t.value);const b=t.parentElement.querySelector('b');if(b)b.textContent=t.value+'/5';logSaved()};
INP.ident=t=>st.set('ident',t.value);
