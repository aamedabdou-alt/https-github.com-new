/* ========== الرئيسية ========== */
function nextLesson(){
  const base=td(),nm=nowMin();
  for(let i=0;i<8;i++){
    const k=addDays(base,i),items=dayItems(k).items.filter(x=>x.tag==='lesson'&&(i>0||x.t0>nm));
    if(items.length){const x=items[0];return{x:x,k:k,mins:i*1440+x.t0-nm}}
  }
  return null;
}
RD.home=()=>{
  const k=td(),n=new Date();
  const di=dayItems(k),nn=nowNext(di.items,nowMin());
  const planned=sum(morning(k).filter(x=>x.type==='focus').map(x=>x.e-x.s))||150;
  const f=foodTotals(k),T0=taskToday(),g=D.gym(k),gymDay=cfg.gymDays.includes(n.getDay());
  const lim=cfg.kcal,study=D.study(k),water=D.water(k),rd=D.read(k);
  const nl=nextLesson(),al=alarmInfo();
  const curH=nn.cur?'<div class="b" style="font-size:1.25rem">'+esc(nn.cur.label)+'</div><div class="mut sm">'+t12(nn.cur.t0)+(nn.cur.t1>nn.cur.t0?' – '+t12(nn.cur.t1):'')+'</div>'+bar(nn.cur.t1>nn.cur.t0?clamp((nowMin()-nn.cur.t0)/(nn.cur.t1-nn.cur.t0),0,1):0):'<div class="mut">لا نشاط محدد الآن</div>';
  const nxtH=nn.next?'<div class="mut sm" style="margin-top:8px">التالي</div><div class="b">'+esc(nn.next.label)+'</div><div class="mut sm">بعد '+dur(nn.next.t0-nowMin())+' · '+t12(nn.next.t0)+'</div>':'';
  const tl=taskList('today').slice(0,5);
  const rings='<div class="rings">'+
    ring(study/planned,Math.round(study)+'د','المذاكرة','من '+planned+' د','#9fb4ff','study')+
    ring(T0.done+T0.open?T0.done/(T0.done+T0.open):0,T0.done+'/'+(T0.done+T0.open),'المهام','اليوم','#9bb1c8','tasks')+
    ring(water/cfg.water.goal,Math.round(water/cfg.water.goal*100)+'%','الماء',(water/1000).toFixed(1)+' ل','#7cc7e8','water')+
    ring(f.kcal/lim,f.kcal,'السعرات','من '+lim,f.kcal>lim?'#e8806a':'#b7d68b','food')+
    ring(rd/cfg.read.target,Math.round(rd)+'د','القراءة','من '+cfg.read.target+' د','#e8a1c9','read')+
    ring(gymDay?(g&&g.done?1:0):1,gymDay?(g&&g.done?'تم':'—'):'راحة','التمرين',gymDay?(cfg.split[n.getDay()]||''):'يوم راحة','#ff9f6b','gym')+'</div>';
  return '<div class="hero"><p class="mut" id="greet"></p><h1>'+esc(me()||'أهلاً بك')+'</h1><div class="mut" id="who">'+whoHTML()+'</div><p class="wis">'+esc(wisdomNow())+'</p>'+
    '<div class="row mut"><span id="dt"></span><span id="tm"></span></div>'+
    '<div class="row" style="margin-top:10px"><span>باقٍ على الامتحان: <b id="left" class="ac">—</b> يوماً</span><input type="date" id="exam" data-c="exam" aria-label="موعد الامتحان"></div>'+
    '<div style="margin-top:14px;max-width:640px" id="hq"></div><button class="btn g s" data-a="newq" style="margin-top:6px">جملة أخرى</button></div>'+
    '<div class="grid" style="margin-top:12px">'+
    card('الآن والتالي',curH+nxtH+(di.items.some(x=>x.cf)?'<p class="warn sm" style="margin:8px 0 0">يوجد تعارض في جدول اليوم، راجعه في قسم الروتين.</p>':''),{cls:'glow'})+
    card('منبه الصباح','<div class="b" style="font-size:1.15rem">'+al.text+'</div><div class="mut sm">'+al.sub+'</div><div class="row" style="margin-top:10px"><button class="btn s" data-a="go" data-g="alarm">إعداد المنبه</button>'+(al.canCancel?'<button class="btn d s" data-a="almSkip">'+(al.skipped?'إعادة تفعيل منبه الغد':'إلغاء منبه الغد')+'</button>':'')+'</div>')+
    card('تقدّم اليوم',rings,{cls:'full'})+
    card('الدرس القادم',nl?'<div class="b" style="font-size:1.15rem">'+esc(nl.x.label)+'</div><div class="mut">'+(nl.k===k?'اليوم':DN[wdOf(nl.k)])+' · '+t12(nl.x.t0)+'</div><div class="ac b" style="margin-top:4px">بعد '+dur(nl.mins)+'</div>':'<div class="mut">لا دروس قادمة هذا الأسبوع</div>')+
    card('اختصارات','<div class="row"><button class="btn" data-a="homeFocus">ابدأ تركيز</button><button class="btn g" data-a="homeWater">+ كوب ماء</button><button class="btn g" data-a="go" data-g="tasks">مهمة جديدة</button><button class="btn g" data-a="go" data-g="notes">ملاحظة سريعة</button></div>')+
    card('مهام اليوم',tl.length?'<ul class="list">'+tl.map(t=>'<li><input type="checkbox" data-c="tchk" data-id="'+t.id+'" aria-label="تم"><span class="t">'+esc(t.t)+'</span>'+taskBadge(t)+'</li>').join('')+'</ul>':'<div class="empty">لا مهام لليوم. استمتع أو أضف مهمة.</div>',{r:T0.done+'/'+(T0.done+T0.open)})+
    '</div>';
};
PO.home=()=>{clock();cdExam();hq();const e=$('#exam');if(e)e.value=st.get('exam','');cdExam()};
function clock(){
  const n=new Date(),h=n.getHours(),g=$('#greet');
  if(g)g.textContent=greeting()+(firstName()?' يا '+firstName():'');
  const dt=$('#dt');if(dt){dt.textContent=n.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'});$('#tm').textContent=n.toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'})}
  const c=$('#clock');if(c)c.textContent=n.toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
}
function cdExam(){const e=$('#exam'),l=$('#left');if(!e||!l)return;const v=e.value||st.get('exam','');l.textContent=v?(Math.max(0,Math.ceil((new Date(v+'T00:00:00')-new Date())/864e5))||0):'—'}
function hq(){const h=$('#hq');if(!h)return;h.innerHTML=qh(rq());if(A)G.from(h,{opacity:0,y:10,duration:1})}
CHG.exam=t=>{st.set('exam',t.value);cdExam()};
ACT.newq=hq;
ACT.homeFocus=()=>{const nn=nowNext(dayItems(td()).items,nowMin());const x=[nn.cur,nn.next].find(i=>i&&i.tag==='study'&&i.subj);startFocus(x?{subj:x.subj,m:Math.max(10,Math.round(x.t1-x.t0))||50,bi:x.bi}:{subj:'prog',m:50})};
ACT.homeWater=()=>{addWater(cfg.water.cup);renderSec('home')};

/* ========== المذاكرة ========== */
let stCur='ar';
const WSTART=['03:00','03:30','04:00','04:30','05:00','05:30','06:00','07:00','08:00','14:00','15:00','16:00','17:00','18:00','19:00'],WEND=['06:30','07:00','07:30','08:00','08:30','09:00','10:00','12:00','16:00','17:00','18:00','19:00','20:00','21:00'];
const PALETTE=['#8fb3ff','#e8a1c9','#7fd6c8','#e3b866','#b8a5ff','#ff9f6b'];
RD.study=()=>{
  const k=td(),w=wdOf(k),win=winOf(w),mb=morning(k),sd=st.get('sdone',{})[k]||{},fMin=sum(mb.filter(x=>x.type==='focus').map(x=>x.e-x.s));
  const P=prayers(k);
  const blocks=mb.length?'<ul class="tl">'+mb.map(b=>{
    if(b.type==='pray')return '<li class="tg-pray"><div class="tm">'+t12(b.s)+'<small>الفجر ≈ '+t12(P.fajr)+'</small></div><div class="lb"><span class="t">صلاة الفجر وأذكار الصباح</span></div><span class="pill c" style="--c:#e3b866">عبادة</span></li>';
    const s=sub(b.subj),dn=!!sd[b.i];
    return '<li class="'+(dn?'dn ':'')+(nowMin()>=b.s&&nowMin()<b.e?'now':'')+'"><div class="tm">'+t12(b.s)+'<small>'+(b.e-b.s)+' د</small></div><div class="lb"><span class="t"><b style="color:'+s.c+'">●</b> '+esc(s.n)+'</span></div><div class="ac2"><button class="btn s" data-a="blk" data-i="'+b.i+'">ابدأ</button><input type="checkbox" data-c="blkdone" data-i="'+b.i+'" '+(dn?'checked':'')+' aria-label="تمت"></div></li>'}).join('')+'</ul>':'<div class="empty">لا توجد كتل ضمن هذه النافذة. وسّع وقت الدراسة.</div>';
  const winCard=card('جدول المذاكرة: '+DN[w],
    '<div class="row"><label class="f">بداية الدراسة<select data-c="wstart">'+opts(WSTART.map(x=>[x,t12(pm(x))]),win[0])+'</select></label><label class="f">النهاية<select data-c="wend">'+opts(WEND.map(x=>[x,t12(pm(x))]),win[1])+'</select></label><button class="btn g s" data-a="winall" style="align-self:flex-end">تعميم على كل الأيام</button></div>'+
    '<div class="mut sm" style="margin:8px 0">جلسة '+cfg.focus+' دقيقة ثم راحة '+cfg.brk+' دقائق. وقت الفجر محسوب لمدينتك ويتغيّر تلقائياً مع الفصول.</div>'+blocks+
    '<div class="row sp sm mut" style="margin-top:8px"><span>مخطط: '+dur(fMin)+'</span><span>أُنجز اليوم: '+dur(D.study(k))+'</span></div>'+bar(fMin?D.study(k)/fMin:0));
  const free=card('جلسة حرة','<div class="row"><label class="f">المادة<select id="fsub">'+subs().concat([{k:'rev',n:'مراجعة'}]).map(s=>'<option value="'+s.k+'">'+esc(s.n)+'</option>').join('')+'</select></label><label class="f">الدقائق<input type="number" id="fmn" min="5" max="240" value="50" style="width:90px"></label><button class="btn big" data-a="freeStart" style="align-self:flex-end">ابدأ بملء الشاشة</button></div><div class="mut sm" style="margin-top:8px">شاشة سوداء ورقم كبير وصوت هادئ وجمل تحفيزية. جلسات اليوم: '+(st.get('done',{})[k]||0)+'</div>');
  const dayRows=WORD.map(d=>{const wn=winOf(d),pl=planOf(d);return '<tr><td class="b">'+DN[d]+(lessonish(d)?'<br><small class="mut">'+(cfg.arabic.days.includes(d)?'عربي ':'')+(cfg.prog.days.includes(d)?'برمجة':'')+'</small>':'')+'</td><td><select data-c="wstartD" data-w="'+d+'">'+opts(WSTART.map(x=>[x,t12(pm(x))]),wn[0])+'</select></td><td><select data-c="wendD" data-w="'+d+'">'+opts(WEND.map(x=>[x,t12(pm(x))]),wn[1])+'</select></td>'+[0,1,2,3].map(i=>'<td><select data-c="plansel" data-w="'+d+'" data-i="'+i+'">'+opts(subs().concat([{k:'rev',n:'مراجعة'}]).map(s=>[s.k,s.n]),pl[i])+'</select></td>').join('')+'</tr>'}).join('');
  const plan=card('خطة الأسبوع','<div class="mut sm" style="margin-bottom:6px">اختر مادة لكل كتلة. التاريخ محجوز في الخطة عدة مرات أسبوعياً حتى تبدأه براحتك.</div><div class="scx"><table class="tb" style="min-width:760px"><thead><tr><th>اليوم</th><th>يبدأ</th><th>ينتهي</th><th>الكتلة 1</th><th>الكتلة 2</th><th>الكتلة 3</th><th>الكتلة 4</th></tr></thead><tbody>'+dayRows+'</tbody></table></div>',{cls:'full'});
  const les=(key,title,extra)=>{const c=cfg[key];return '<div style="border-top:1px solid var(--line);padding:10px 0"><div class="row sp"><label class="f grow" style="flex:1">اسم الدرس<input type="text" data-c="lesname" data-k="'+key+'" value="'+esc(c.name||title)+'"></label>'+(key==='eng'?'<label class="row sm"><input type="checkbox" data-c="lesOn" data-k="eng" '+(c.on?'checked':'')+'> مفعّلة</label>':'')+'</div><div class="row" style="margin:6px 0"><label class="f">الوقت<input type="time" data-c="les" data-k="'+key+'" data-f="time" value="'+c.time+'"></label><label class="f">المدة (د)<input type="number" min="15" max="300" data-c="les" data-k="'+key+'" data-f="dur" value="'+c.dur+'" style="width:84px"></label>'+(key==='prog'?'<label class="f">الانتقال (د)<input type="number" min="0" max="120" data-c="les" data-k="prog" data-f="trav" value="'+c.trav+'" style="width:84px"></label>':'')+'</div>'+dayChips(c.days,'lday').replace(/data-a="lday"/g,'data-a="lday" data-k="'+key+'"')+(extra?'<div class="mut sm" style="margin-top:6px">'+extra+'</div>':'')+'</div>'};
  const lessons=card('دروسي','<div class="mut sm">تدخل هذه المواعيد تلقائياً في الروتين والتنبيهات.</div>'+les('arabic','الدرس الأول','')+les('prog','الدرس الثاني (خارج البيت)','الانتقال يُحسب ذهاباً وإياباً.')+les('eng','حصة أونلاين','تظهر كمذاكرة في الجدول في الأيام المحددة.'));
  const hist=(st.get('topics',{}).hist||[]).length===0&&stCur==='hist';
  const L=(st.get('topics',{})[stCur])||[],dn=L.filter(o=>o.d).length;
  const topics=card('موادي','<div class="chips" id="sChips">'+subs().map(s=>chip(s.k===stCur,'data-a="subpick" data-k="'+s.k+'"',esc(s.n))).join('')+'</div>'+
    '<div class="row sp sm mut" style="margin-top:8px"><span>'+esc(sub(stCur).n)+'</span><span>'+dn+'/'+L.length+'</span></div>'+bar(L.length?dn/L.length:0)+
    (L.length?'<ul class="list">'+L.map((o,i)=>'<li class="'+(o.d?'done':'')+'"><input type="checkbox" data-c="topchk" data-i="'+i+'" '+(o.d?'checked':'')+' aria-label="تم"><span class="t">'+esc(o.x)+'</span><button class="x" data-a="topdel" data-i="'+i+'" aria-label="حذف">×</button></li>').join('')+'</ul>':'<div class="empty">لا دروس بعد. أضف درساً من كتاب الوزارة.</div>')+
    (stCur==='hist'&&L.length===0?'<div class="callout"><b>لم تبدأ التاريخ بعد؟</b><br><span class="mut sm">جاهز لك مسار بداية من خمس خطوات، يوفّر عليك التفكير.</span><br><button class="btn s" data-a="histkit" style="margin-top:6px">أضف مسار البداية</button></div>':'')+
    '<div class="row" style="margin-top:8px"><input type="text" id="sIn" class="grow" placeholder="أضف درساً" data-en="#sAdd"><button class="btn" id="sAdd" data-a="topadd">أضف</button></div>'+
    '<div class="row" style="margin-top:10px"><input type="text" id="subIn" class="grow" placeholder="إضافة مادة جديدة" data-en="#subAdd"><button class="btn g" id="subAdd" data-a="subadd">مادة</button></div>');
  const sm=D.smin(k),sbars=subs().concat([{k:'rev',n:'مراجعة',c:'#b8a5ff'}]).filter(s=>sm[s.k]).map(s=>'<div class="row sp sm"><span>'+esc(s.n)+'</span><span class="num">'+dur(sm[s.k])+'</span></div><div class="bar"><i style="width:'+clamp(sm[s.k]/Math.max(60,fMin)*100,0,100)+'%;background:'+(sub(s.k).c)+'"></i></div>').join('');
  const wk=ago(7).map(d=>({l:DN[wdOf(d)].slice(0,3),v:D.study(d)/60,c:d===k?'var(--acc)':null}));
  const weekTot=sum(ago(7).map(d=>D.study(d)));
  let streak=0;for(let i=0;i<60;i++){if(D.study(addDays(k,-i))>=30)streak++;else if(i>0)break;else if(i===0)continue}
  const stats=card('إحصاءات','<div class="tiles" style="margin-bottom:10px"><div class="tile"><b>'+dur(D.study(k))+'</b><span>اليوم</span></div><div class="tile"><b>'+(weekTot/60).toFixed(1)+' س</b><span>آخر 7 أيام</span></div><div class="tile"><b>'+streak+'</b><span>أيام متتالية (30 د فأكثر)</span></div></div>'+(sbars||'<div class="mut sm">لم تُسجَّل مذاكرة اليوم بعد.</div>')+'<div class="mut sm" style="margin-top:10px">الساعات يومياً</div>'+bars(wk,{fmt:v=>v.toFixed(1)}));
  return '<div class="grid">'+winCard+free+lessons+plan+topics+stats+'</div>';
};
CHG.wstart=t=>{const k=td(),w=wdOf(k),c=winOf(w);cfg.win[w]=[t.value,c[1]];saveCfg();renderSec('study')};
CHG.wend=t=>{const k=td(),w=wdOf(k),c=winOf(w);cfg.win[w]=[c[0],t.value];saveCfg();renderSec('study')};
CHG.wstartD=t=>{const w=+t.dataset.w,c=winOf(w);cfg.win[w]=[t.value,c[1]];saveCfg();renderSec('study')};
CHG.wendD=t=>{const w=+t.dataset.w,c=winOf(w);cfg.win[w]=[c[0],t.value];saveCfg();renderSec('study')};
ACT.winall=()=>{const c=winOf(wdOf(td()));cfg.studyStart=c[0];cfg.studyEnd=c[1];cfg.win={};saveCfg();renderSec('study');toast('طُبّق على كل الأيام')};
CHG.plansel=t=>{const w=+t.dataset.w,a=planOf(w).slice();a[+t.dataset.i]=t.value;cfg.plan[w]=a;saveCfg();renderSec('study')};
ACT.blk=t=>{const k=td(),b=morning(k).find(x=>x.type==='focus'&&x.i===+t.dataset.i);if(!b)return;startFocus({subj:b.subj,m:b.e-b.s,bi:b.i,label:'مذاكرة: '+sub(b.subj).n})};
CHG.blkdone=t=>{const k=td(),a=st.get('sdone',{});a[k]=a[k]||{};if(t.checked)a[k][t.dataset.i]=1;else delete a[k][t.dataset.i];st.set('sdone',a);renderSec('study')};
ACT.freeStart=()=>{startFocus({subj:$('#fsub').value,m:clamp(parseInt($('#fmn').value,10)||50,5,240)})};
CHG.les=t=>{const c=cfg[t.dataset.k],f=t.dataset.f;c[f]=(f==='time')?t.value:clamp(parseInt(t.value,10)||0,0,300);saveCfg();renderSec('study')};
CHG.lesname=t=>{cfg[t.dataset.k].name=t.value.trim().slice(0,40);saveCfg()};
CHG.lesOn=t=>{cfg[t.dataset.k].on=t.checked;saveCfg()};
ACT.lday=t=>{const c=cfg[t.dataset.k],w=+t.dataset.w,i=c.days.indexOf(w);if(i>=0)c.days.splice(i,1);else c.days.push(w);saveCfg();renderSec('study')};
ACT.subpick=t=>{stCur=t.dataset.k;renderSec('study')};
const tops=()=>st.get('topics',{});
ACT.topadd=()=>{const v=$('#sIn').value.trim();if(!v)return;const a=tops();(a[stCur]=a[stCur]||[]).push({x:v,d:false});st.set('topics',a);renderSec('study')};
CHG.topchk=t=>{const a=tops();a[stCur][+t.dataset.i].d=t.checked;st.set('topics',a);renderSec('study')};
ACT.topdel=t=>{const a=tops();a[stCur].splice(+t.dataset.i,1);st.set('topics',a);renderSec('study')};
ACT.histkit=()=>{const a=tops();a.hist=['احصل على كتاب التاريخ وقسّمه إلى وحدات ودروس','اقرأ مقدمة الكتاب وسجّل عدد الدروس والصفحات','ارسم خطاً زمنياً بسيطاً للوحدة الأولى','لخّص الدرس الأول في صفحة واحدة بكلماتك','حل أسئلة نهاية الدرس الأول وراجع إجاباتك'].map(x=>({x:x,d:false}));st.set('topics',a);renderSec('study');toast('أُضيف مسار البداية')};
ACT.subadd=()=>{const v=$('#subIn').value.trim();if(!v)return;cfg.subs=cfg.subs||[];const k='x'+uid();cfg.subs.push({k:k,n:v,e:'',c:PALETTE[cfg.subs.length%PALETTE.length]});saveCfg();stCur=k;renderSec('study')};
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.en&&e.target.tagName==='INPUT'){e.preventDefault();const b=$(e.target.dataset.en);if(b)b.click()}});
