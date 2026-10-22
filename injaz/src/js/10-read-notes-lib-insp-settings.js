/* ========== القراءة ========== */
const BOOKS=()=>st.get('books',[]);
function readStreak(){let n=0;for(let i=0;i<400;i++){const d=addDays(td(),-i);if(D.read(d)>=cfg.read.target*.6)n++;else if(i>0)break}return n}
RD.read=()=>{
  const k=td(),m=D.read(k),tg=cfg.read.target,bk=BOOKS(),cur=bk.filter(b=>!b.done),done=bk.filter(b=>b.done);
  const top=card('قراءة اليوم','<div class="row" style="gap:18px;align-items:center"><div style="width:110px">'+ring(m/tg,Math.round(m/tg*100)+'٪','','','#e8a1c9')+'</div><div class="grow"><div class="big-n ac">'+m+'<small style="font-size:1rem"> د</small></div><div class="mut">الهدف '+tg+' دقيقة · التزام متتالٍ '+readStreak()+' يوم</div></div></div>'+
    '<div class="row" style="margin-top:12px"><select id="rdbk" class="grow">'+(cur.length?opts(cur.map(b=>[b.id,b.t]),(cur[0]||{}).id):'<option value="">بدون كتاب محدد</option>')+'</select><input type="number" id="rdm" min="5" max="180" value="25" style="width:80px" aria-label="دقائق"><button class="btn" data-a="rdgo">ابدأ القراءة</button></div>'+
    '<div class="row" style="margin-top:10px"><label class="f">هدف القراءة اليومي<select data-c="rdtg">'+opts([[60,'ساعة'],[75,'ساعة وربع'],[90,'ساعة ونصف']],tg)+'</select></label><label class="f">أفضل وقت<select data-c="rdpos">'+opts([['morning','بعد الفطار'],['afternoon','بعد العصر'],['evening','المساء']],cfg.read.pos)+'</select></label></div>');
  const books=card('كتبي','<ul class="list">'+(cur.map(b=>{const p=b.pages?Math.min(1,(b.cur||0)/b.pages):0;const rem=b.pages?Math.max(0,b.pages-(b.cur||0)):0;const avg=Math.max(1,Math.round(sum(ago(14).map(d=>sum(D.rlog(d).filter(x=>x.book===b.id).map(x=>x.pages||0))))/14));
    return '<li style="flex-wrap:wrap"><div class="t"><b>'+esc(b.t)+'</b>'+(b.a?'<span class="mut sm"> · '+esc(b.a)+'</span>':'')+(b.pages?bar(p)+'<div class="mut sm">'+(b.cur||0)+' / '+b.pages+' صفحة'+(rem&&avg>1?' · تنتهي بعد نحو '+Math.ceil(rem/avg)+' يوماً':'')+'</div>':'')+'</div><button class="btn g s" data-a="bkpg" data-id="'+b.id+'">تحديث</button><button class="btn g s" data-a="bkfin" data-id="'+b.id+'">أنهيته</button><button class="x" data-a="bkdel" data-id="'+b.id+'" aria-label="حذف">×</button></li>'}).join('')||'<li class="mut">أضف أول كتاب تقرؤه.</li>')+'</ul>'+
    (done.length?'<div class="b sm" style="margin-top:8px">أنهيتها ('+done.length+')</div><ul class="list">'+done.map(b=>'<li class="done"><span class="t">'+esc(b.t)+'</span><button class="x" data-a="bkdel" data-id="'+b.id+'" aria-label="حذف">×</button></li>').join('')+'</ul>':'')+
    '<div class="row" style="margin-top:8px"><input type="text" id="bk_t" placeholder="اسم الكتاب" class="grow"><input type="text" id="bk_a" placeholder="المؤلف" style="width:130px"><input type="number" id="bk_p" placeholder="الصفحات" style="width:90px"><button class="btn" data-a="bkadd">إضافة</button></div>',{cls:'full'});
  const wk=ago(7).map(d=>({l:DN[wdOf(d)].slice(0,3),v:D.read(d),c:D.read(d)>=tg?'#e8a1c9':'#9a6a86'}));
  const chart=card('آخر 7 أيام',bars(wk,{max:Math.max(tg,1)})+'<div class="mut sm">الوردي الفاتح يعني أنك حققت هدفك.</div>');
  const rec=ago(7).reverse().flatMap(d=>D.rlog(d).map(x=>({d:d,x:x}))).slice(0,8);
  const log=card('آخر الجلسات','<ul class="list">'+(rec.map(r=>{const b=bk.find(z=>z.id===r.x.book);return '<li><span class="t">'+esc(b?b.t:'قراءة حرة')+'<div class="mut sm">'+(r.d===k?'اليوم':DN[wdOf(r.d)])+'</div></span><span class="num">'+r.x.min+' د'+(r.x.pages?' · '+r.x.pages+' ص':'')+'</span></li>'}).join('')||'<li class="mut">لا جلسات بعد.</li>')+'</ul><div class="row"><input type="number" id="rmm" min="1" placeholder="دقائق" style="width:90px"><button class="btn g s" data-a="rdman">تسجيل يدوي</button></div>');
  return '<div class="grid">'+top+chart+books+log+'</div>';
};
CHG.rdtg=t=>{cfg.read.target=+t.value;saveCfg();renderSec('read')};
CHG.rdpos=t=>{cfg.read.pos=t.value;saveCfg();renderSec('read')};
ACT.rdgo=()=>{const id=($('#rdbk')||{}).value||'',b=BOOKS().find(x=>x.id===id);startFocus({kind:'read',m:clamp(parseInt($('#rdm').value,10)||25,5,180),book:id,label:'قراءة'+(b?': '+b.t:'')})};
ACT.rdman=()=>{const m=parseInt($('#rmm').value,10);if(!m)return;const a=st.get('rlog',{}),k=td();a[k]=a[k]||[];a[k].push({id:uid(),book:'',min:m,pages:0,at:Date.now()});st.set('rlog',a);renderSec('read')};
ACT.bkadd=()=>{const t=$('#bk_t').value.trim();if(!t){toast('اكتب اسم الكتاب');return}const a=BOOKS();a.push({id:uid(),t:t,a:$('#bk_a').value.trim(),pages:parseInt($('#bk_p').value,10)||0,cur:0,done:false,at:Date.now()});st.set('books',a);renderSec('read')};
ACT.bkdel=t=>{ask('حذف هذا الكتاب من القائمة؟','حذف',()=>{st.set('books',BOOKS().filter(b=>b.id!==t.dataset.id));renderSec('read')},true)};
ACT.bkfin=t=>{const a=BOOKS(),b=a.find(x=>x.id===t.dataset.id);if(b){b.done=true;if(b.pages)b.cur=b.pages;st.set('books',a);toast('مبارك إنهاء الكتاب');renderSec('read')}};
ACT.bkpg=t=>{const b=BOOKS().find(x=>x.id===t.dataset.id);if(!b)return;sheet('<h3>'+esc(b.t)+'</h3><label class="f">وصلت إلى الصفحة<input type="number" id="bpg" value="'+(b.cur||0)+'"></label><div class="row" style="margin-top:12px"><button class="btn" data-a="bkpgs" data-id="'+b.id+'">حفظ</button></div>')};
ACT.bkpgs=t=>{const a=BOOKS(),b=a.find(x=>x.id===t.dataset.id);if(b){b.cur=parseInt($('#bpg').value,10)||0;st.set('books',a)}closeSheet();renderSec('read')};
function askPages(id){
  const a=st.get('rlog',{}),k=td(),e=(a[k]||[]).find(x=>x.id===id);if(!e)return;
  const b=BOOKS().find(x=>x.id===e.book);
  sheet('<h3>كم صفحة قرأت؟</h3><p class="mut sm">'+(b?esc(b.t):'قراءة حرة')+' · '+e.min+' دقيقة</p><input type="number" id="pgn" min="0" placeholder="عدد الصفحات" style="width:100%"><div class="row" style="margin-top:12px"><button class="btn" data-a="pgsave" data-id="'+id+'">حفظ</button><button class="btn g" data-close>تخطّ</button></div>');
}
ACT.pgsave=t=>{
  const n=parseInt($('#pgn').value,10)||0,a=st.get('rlog',{}),k=td(),e=(a[k]||[]).find(x=>x.id===t.dataset.id);
  if(e){e.pages=n;st.set('rlog',a);const bs=BOOKS(),b=bs.find(x=>x.id===e.book);if(b&&n){b.cur=(b.cur||0)+n;if(b.pages&&b.cur>=b.pages){b.cur=b.pages}st.set('books',bs)}}
  closeSheet();renderSec(curSec);
};

/* ========== الملاحظات ========== */
const NOTES=()=>st.get('notes',[]);
let nq='',ntag='';
RD.notes=()=>{
  const all=NOTES(),tags=[...new Set(all.map(n=>n.tag).filter(Boolean))];
  let ls=all.filter(n=>(!ntag||n.tag===ntag)&&(!nq||(n.t+' '+n.b).includes(nq)));
  ls.sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||b.up-a.up);
  const bar1='<div class="row" style="margin-bottom:10px"><input type="search" placeholder="ابحث في ملاحظاتك" value="'+esc(nq)+'" data-i="nq" class="grow"><button class="btn" data-a="nnew">+ ملاحظة جديدة</button><button class="btn g" data-a="nexp">تصدير</button></div>'+(tags.length?'<div class="chips" style="margin-bottom:10px">'+chip(!ntag,'data-a="ntag" data-t=""','الكل')+tags.map(t=>chip(ntag===t,'data-a="ntag" data-t="'+esc(t)+'"','#'+esc(t))).join('')+'</div>':'');
  const cards=ls.map(n=>'<div class="card note" data-a="nedit" data-id="'+n.id+'" tabindex="0" role="button">'+(n.pin?'<span class="pill c" style="--c:var(--acc)">مثبّتة</span> ':'')+'<h3><span>'+esc(n.t||'بدون عنوان')+'</span></h3><div class="nb">'+esc(n.b).slice(0,260)+'</div><div class="mut sm">'+(n.tag?'#'+esc(n.tag)+' · ':'')+new Date(n.up).toLocaleDateString('ar-EG',{day:'numeric',month:'short'})+'</div></div>').join('');
  return bar1+(cards?'<div class="grid">'+cards+'</div>':'<div class="empty">'+(all.length?'لا نتائج.':'اكتب أول ملاحظة. أفكار، أسئلة، أكواد، أي شيء.')+'</div>');
};
INP.nq=t=>{nq=t.value;renderSec('notes');const i=$('[data-i=nq]');if(i){i.focus();i.setSelectionRange(nq.length,nq.length)}};
ACT.ntag=t=>{ntag=t.dataset.t;renderSec('notes')};
function noteForm(n){
  n=n||{id:'',t:'',b:'',tag:'',pin:false};
  sheet('<h3>'+(n.id?'تعديل الملاحظة':'ملاحظة جديدة')+'</h3><input type="text" id="n_t" placeholder="العنوان" value="'+esc(n.t)+'" style="width:100%;margin-bottom:8px"><textarea id="n_b" rows="9" placeholder="اكتب هنا..." style="width:100%">'+esc(n.b)+'</textarea><div class="row" style="margin-top:8px"><input type="text" id="n_g" placeholder="وسم (مثال: برمجة)" value="'+esc(n.tag)+'" class="grow"><label class="row sm"><input type="checkbox" id="n_p" '+(n.pin?'checked':'')+'> تثبيت</label></div><div class="row" style="margin-top:12px"><button class="btn" data-a="nsave" data-id="'+n.id+'">حفظ</button>'+(n.id?'<button class="btn d" data-a="ndel" data-id="'+n.id+'">حذف</button>':'')+'</div>',()=>{setTimeout(()=>{const e=$('#n_b');if(e&&!n.id)e.focus()},50)});
}
ACT.nnew=()=>noteForm();
ACT.nedit=t=>noteForm(NOTES().find(n=>n.id===t.dataset.id));
ACT.nsave=t=>{
  const a=NOTES(),id=t.dataset.id,o={t:$('#n_t').value.trim(),b:$('#n_b').value,tag:$('#n_g').value.trim().replace(/^#/,''),pin:$('#n_p').checked,up:Date.now()};
  if(!o.t&&!o.b.trim()){closeSheet();return}
  if(id){Object.assign(a.find(n=>n.id===id),o)}else a.push(Object.assign({id:uid()},o));
  st.set('notes',a);closeSheet();renderSec('notes');
};
ACT.ndel=t=>{ask('حذف هذه الملاحظة نهائياً؟','حذف',()=>{st.set('notes',NOTES().filter(n=>n.id!==t.dataset.id));renderSec('notes')},true)};
function dl(name,text,type){const u=URL.createObjectURL(new Blob([text],{type:type||'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
ACT.nexp=()=>{const t=NOTES().map(n=>'## '+(n.t||'بدون عنوان')+(n.tag?'  #'+n.tag:'')+'\n'+n.b).join('\n\n---\n\n');if(!t){toast('لا ملاحظات');return}dl('ملاحظاتي.md',t,'text/markdown;charset=utf-8')};

/* ========== المكتبة ========== */
let libCat='',libItems=[];
const LCATS=['ملخصات','كتب','تمارين','أخرى'];
RD.lib=()=>{
  const ls=libItems.filter(f=>!libCat||f.cat===libCat);
  return booksCard()+'<div class="row" style="margin-bottom:10px"><label class="btn">رفع ملفات<input type="file" multiple hidden data-c="libup"></label><select data-c="libcat" aria-label="التصنيف">'+opts(LCATS,'ملخصات')+'</select><span class="mut sm">تُحفظ على جهازك فقط وتعمل دون إنترنت.</span></div>'+
    '<div class="chips" style="margin-bottom:10px">'+chip(!libCat,'data-a="libf" data-c=""','الكل')+LCATS.map(c=>chip(libCat===c,'data-a="libf" data-c="'+c+'"',c)).join('')+'</div>'+
    (ls.length?'<div class="grid">'+ls.map(f=>'<div class="card"><h3><span>'+esc(f.name)+'</span></h3><div class="mut sm">'+esc(f.cat)+' · '+(f.size/1024<1024?Math.round(f.size/1024)+' ك.ب':(f.size/1048576).toFixed(1)+' م.ب')+'</div><div class="row" style="margin-top:8px"><button class="btn s" data-a="libopen" data-id="'+f.id+'">فتح</button><button class="btn g s" data-a="libdl" data-id="'+f.id+'">تنزيل</button><button class="x" data-a="libdel" data-id="'+f.id+'" aria-label="حذف">×</button></div></div>').join('')+'</div>':'<div class="empty">لا ملفات بعد. ارفع ملخصاتك وكتبك وملفات PDF.</div>');
};
PO.lib=async()=>{try{const r=await libTx('readonly',s=>s.getAll());const n=(r||[]).sort((a,b)=>b.at-a.at);if(JSON.stringify(n.map(x=>x.id))!==JSON.stringify(libItems.map(x=>x.id))){libItems=n;if(curSec==='lib')renderSec('lib')}}catch(e){}};
let libUpCat='ملخصات';
CHG.libcat=t=>{libUpCat=t.value};
CHG.libup=async t=>{
  const fs=[...t.files];for(const f of fs){try{await libTx('readwrite',s=>s.add({name:f.name,type:f.type,size:f.size,cat:libUpCat,at:Date.now(),blob:f}))}catch(e){toast('تعذر حفظ '+f.name)}}
  t.value='';libItems=[];renderSec('lib');if(fs.length)toast('رُفع '+fs.length+' ملف');
};
ACT.libf=t=>{libCat=t.dataset.c;renderSec('lib')};
const libGet=id=>libItems.find(f=>String(f.id)===String(id));
ACT.libopen=t=>{const f=libGet(t.dataset.id);if(!f)return;window.open(URL.createObjectURL(f.blob),'_blank')};
ACT.libdl=t=>{const f=libGet(t.dataset.id);if(!f)return;const u=URL.createObjectURL(f.blob),a=document.createElement('a');a.href=u;a.download=f.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),3000)};
ACT.libdel=t=>{ask('حذف الملف من مكتبتك؟','حذف',async()=>{await libTx('readwrite',s=>s.delete(+t.dataset.id));libItems=libItems.filter(f=>String(f.id)!==t.dataset.id);renderSec('lib')},true)};

/* ========== الإلهام والأهداف ========== */
let qcur=null,qf='';
const QN={a:'آيات',h:'أحاديث',m:'حِكَم',e:'English'};
RD.insp=()=>{
  qcur=qcur||rq();const gl=st.get('goals',[]),fav=st.get('qfav',[]),isF=fav.includes(qcur[1]);
  const top=card('لك اليوم','<div style="font-size:1.5rem;line-height:1.8;text-align:center;padding:10px 0" id="iq">'+qh(qcur)+'</div><div class="row" style="justify-content:center"><button class="btn" data-a="inq">أخرى</button><button class="btn g" data-a="infav">'+(isF?'إزالة من المفضلة':'أضف للمفضلة')+'</button></div>',{cls:'full glow'});
  const goals=card('أهدافي','<div class="mut sm" style="margin-bottom:6px">اكتب هدفك بوضوح وبموعد. الهدف المكتوب يصير خطة.</div><ul class="list">'+(gl.map(g=>'<li class="'+(g.done?'done':'')+'"><input type="checkbox" data-c="goalchk" data-id="'+g.id+'" '+(g.done?'checked':'')+' aria-label="تم"><span class="t">'+esc(g.t)+(g.d?'<div class="mut sm">'+g.d+'</div>':'')+'</span><button class="x" data-a="goaldel" data-id="'+g.id+'" aria-label="حذف">×</button></li>').join('')||'<li class="mut">لا أهداف بعد.</li>')+'</ul><div class="row"><input type="text" id="g_t" placeholder="مثال: أنهي منهج البرمجة قبل ديسمبر" class="grow"><input type="date" id="g_d"><button class="btn" data-a="goaladd">إضافة</button></div>');
  const vis=card('رؤيتي','<label class="f">لماذا أفعل كل هذا؟<textarea rows="4" data-i="vision" placeholder="اكتب الصورة التي تريد أن تصل إليها">'+esc(st.get('vision',''))+'</textarea></label>');
  const list=Q.filter(q=>!qf||(qf==='fav'?fav.includes(q[1]):q[0]===qf));
  const all=card('كل الاقتباسات','<div class="chips" style="margin-bottom:8px">'+chip(!qf,'data-a="qfil" data-f=""','الكل')+Object.keys(QN).map(k=>chip(qf===k,'data-a="qfil" data-f="'+k+'"',QN[k])).join('')+chip(qf==='fav','data-a="qfil" data-f="fav"','المفضلة')+'</div><ul class="list">'+list.map(q=>'<li><span class="t" dir="'+(q[0]==='e'?'ltr':'rtl')+'">'+esc(q[1])+(q[2]?'<div class="mut sm">'+esc(q[2])+'</div>':'')+'</span></li>').join('')+'</ul>',{cls:'full'});
  return '<div class="grid">'+top+goals+vis+all+'</div>';
};
ACT.inq=()=>{qcur=rq();renderSec('insp')};
ACT.infav=()=>{let f=st.get('qfav',[]);f=f.includes(qcur[1])?f.filter(x=>x!==qcur[1]):f.concat(qcur[1]);st.set('qfav',f);renderSec('insp')};
ACT.qfil=t=>{qf=t.dataset.f;renderSec('insp')};
INP.vision=t=>st.set('vision',t.value);
ACT.goaladd=()=>{const t=$('#g_t').value.trim();if(!t)return;const a=st.get('goals',[]);a.push({id:uid(),t:t,d:$('#g_d').value,done:false});st.set('goals',a);renderSec('insp')};
CHG.goalchk=t=>{const a=st.get('goals',[]),g=a.find(x=>x.id===t.dataset.id);if(g){g.done=t.checked;st.set('goals',a);if(t.checked)toast('هدف تحقق، ما شاء الله')}renderSec('insp')};
ACT.goaldel=t=>{st.set('goals',st.get('goals',[]).filter(g=>g.id!==t.dataset.id));renderSec('insp')};

/* ========== الإعدادات ========== */
RD.set=()=>{
  const sk=SKINS.find(s=>s.id===skinIdFor(curSec));
  const edc=card('المرحلة الدراسية','<p class="mut sm">'+(eduLabel()?'<b>'+esc(eduLabel())+'</b>':'لم تحدد بعد')+'</p><div class="row"><button class="btn" data-a="edusheet">تغيير المرحلة</button><button class="btn g" data-a="subsheet">موادي</button></div>');
  const bg=card('الخلفية','<p class="mut sm">الخلفية الحالية للقسم: <b>'+esc(sk?sk.n:'مخصصة')+'</b>. عندك جبال وغابات وأنهار وتلال وسماء وألوان وصورك الخاصة.</p><div class="row"><button class="btn" data-a="bgsheet">تغيير الخلفية</button><button class="btn g" data-a="themesheet">ألوان الخط والورق</button></div>');
  const loc=card('الموقع ومواقيت الصلاة','<div class="row"><label class="f grow">اسم المدينة<input type="text" value="'+esc(cfg.loc.name)+'" data-c="locn"></label></div><div class="row" style="margin-top:8px"><label class="f">خط العرض<input type="number" step="0.01" value="'+cfg.loc.lat+'" data-c="lat" style="width:110px"></label><label class="f">خط الطول<input type="number" step="0.01" value="'+cfg.loc.lng+'" data-c="lng" style="width:110px"></label><button class="btn g" data-a="geo" style="align-self:flex-end">موقعي الحالي</button></div>'+
    (()=>{const p=prayers(td());return '<div class="tiles" style="margin-top:12px">'+[['الفجر','fajr'],['الشروق','sunrise'],['الظهر','dhuhr'],['العصر','asr'],['المغرب','maghrib'],['العشاء','isha']].map(x=>'<div class="tile"><b class="num">'+t12(p[x[1]])+'</b><span>'+x[0]+'</span></div>').join('')+'</div>'})()+'<p class="mut sm">الحساب تقريبي بالطريقة المصرية. قارنه بتقويم مسجدك وعدّل الدقائق إن لزم.</p>');
  const sch=card('المدرسة','<label class="row"><input type="checkbox" data-c="schon" '+(cfg.school.on?'checked':'')+'> أظهر وقت المدرسة في جدولي</label>'+(cfg.school.on?'<div class="row" style="margin-top:8px"><label class="f">من<input type="time" value="'+cfg.school.from+'" data-c="schf"></label><label class="f">إلى<input type="time" value="'+cfg.school.to+'" data-c="scht"></label></div>'+dayChips(cfg.school.days,'schday'):'<p class="mut sm">مغلقة افتراضياً لأن جدولك المبكر والدروس هما الأساس. فعّلها لتظهر ويُكشف أي تعارض.</p>'));
  const nt=card('الإشعارات','<p class="mut sm">الحالة: <b>'+(window.Notification?({granted:'مفعّلة',denied:'محظورة من المتصفح',default:'لم تُفعّل بعد'})[Notification.permission]:'غير مدعومة')+'</b></p><button class="btn" data-a="notif">تفعيل الإشعارات</button><p class="mut sm" style="margin-top:8px">تُستخدم لتنبيهات المهام والمنبه والماء. يعمل التنبيه فقط والتطبيق مفتوح في الخلفية.</p>');
  const bk=card('النسخ الاحتياطي','<p class="mut sm">بياناتك محفوظة على هذا الجهاز فقط. صدّر نسخة بين وقت وآخر، واستعدها على أي جهاز.</p><div class="row"><button class="btn" data-a="bkexp">تصدير نسخة</button><label class="btn g">استيراد<input type="file" accept="application/json" hidden data-c="bkimp"></label></div><p class="mut sm" style="margin-top:8px">لا تشمل النسخة ملفات المكتبة وصورة الخلفية.</p>');
  const dg=card('منطقة حساسة','<div class="row"><button class="btn d" data-a="wipe">مسح كل البيانات</button></div>');
  return '<div class="grid">'+edc+bg+loc+sch+nt+bk+dg+'</div>';
};
CHG.locn=t=>{cfg.loc.name=t.value;saveCfg()};
CHG.lat=t=>{cfg.loc.lat=num(t.value,30.59);saveCfg();renderSec('set')};
CHG.lng=t=>{cfg.loc.lng=num(t.value,31.5);saveCfg();renderSec('set')};
ACT.geo=()=>{if(!navigator.geolocation){toast('المتصفح لا يدعم تحديد الموقع');return}navigator.geolocation.getCurrentPosition(p=>{cfg.loc.lat=+p.coords.latitude.toFixed(3);cfg.loc.lng=+p.coords.longitude.toFixed(3);cfg.loc.name='موقعي الحالي';saveCfg();renderSec('set');toast('تم تحديث الموقع')},()=>toast('تعذر تحديد الموقع'),{timeout:10000})};
CHG.schon=t=>{cfg.school.on=t.checked;saveCfg();renderSec('set')};
CHG.schf=t=>{cfg.school.from=t.value;saveCfg()};
CHG.scht=t=>{cfg.school.to=t.value;saveCfg()};
ACT.schday=t=>{const w=+t.dataset.w,a=cfg.school.days,i=a.indexOf(w);if(i<0)a.push(w);else a.splice(i,1);saveCfg();renderSec('set')};
ACT.notif=async()=>{if(!window.Notification){toast('غير مدعومة');return}const r=await Notification.requestPermission();cfg.notify=r==='granted';saveCfg();renderSec('set')};
ACT.bkexp=()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('ab:')&&!k.startsWith('ab:__'))o[k]=localStorage.getItem(k)}dl('نسخة-إنجاز-'+td()+'.json',JSON.stringify(o),'application/json')};
CHG.bkimp=t=>{
  const f=t.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const o=JSON.parse(r.result);ask('سيحل محل بياناتك الحالية. متابعة؟','استعادة',()=>{Object.keys(o).forEach(k=>{if(k.startsWith('ab:')&&!k.startsWith('ab:__')&&!LOCAL_ONLY.includes(k.slice(3))){localStorage.setItem(k,o[k]);if(CLOUD.on&&CLOUD.user)CLOUD.q[k.slice(3)]=1}});if(CLOUD.on&&CLOUD.user)lsSet('ab:__q',JSON.stringify(CLOUD.q));(CLOUD.on&&CLOUD.user?CLOUD.flush():Promise.resolve()).then(()=>location.reload())})}catch(e){toast('ملف غير صالح')}};
  r.readAsText(f);t.value='';
};
ACT.wipe=()=>ask('سيُمسح كل شيء: المهام والسجلات والإعدادات. لا رجوع بعد ذلك.','مسح كل شيء',async()=>{const prof=lsGet('ab:profile'),uid=lsGet('ab:__uid');if(CLOUD.on&&CLOUD.user){try{const r=await CLOUD.client.from('user_kv').delete().eq('user_id',CLOUD.user.id);if(r.error)throw r.error}catch(e){toast(CLOUD.msg(e));return}}clearLocal();if(CLOUD.on&&CLOUD.user){if(uid)lsSet('ab:__uid',uid);if(prof){lsSet('ab:profile',prof);CLOUD.q={profile:1};lsSet('ab:__q',JSON.stringify(CLOUD.q))}}location.reload()},true);
