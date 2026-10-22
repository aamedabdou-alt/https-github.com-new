/* ========== التمارين ========== */
const EXG={'صدر':['بنش بريس','ضغط مائل بالدمبل','فلاي','ضغط أرضي','ديبس'],'ظهر':['سحب علوي','رو بالبار','رو بالكابل','ديدلفت روماني'],'أرجل':['سكوات','ليج بريس','لانجز','ليج كيرل','ليج اكستنشن','سمانة'],'أكتاف':['ضغط أكتاف','رفرفة جانبية','رفرفة خلفية','شرق'],'ذراع':['باي بالبار','باي هامر','ترايسبس بوش داون','ترايسبس أوفرهيد'],'بطن':['بلانك','كرانش','رفع الأرجل','دراجة هوائية'],'كارديو':['مشي سريع','جري','دراجة ثابتة','حبل القفز']};
let exGrp='صدر',restTm=null,restLeft=0;
const GYMS=()=>st.get('gym',{});
function gymGet(k){const g=GYMS()[k];return g||{done:false,type:'',rows:[],note:''}}
function gymSet(k,g){const a=GYMS();a[k]=g;st.set('gym',a)}
function dateOfWd(d){for(let i=0;i<7;i++){const k=addDays(td(),i);if(wdOf(k)===d)return k}return td()}
function lastEx(name,k){
  const a=GYMS(),ds=Object.keys(a).filter(d=>d<k).sort().reverse();
  for(const d of ds){const r=(a[d].rows||[]).find(x=>x.ex===name&&(x.w||x.r));if(r)return r}
  return null;
}
function sleepClass(m){return m<360?'bad':m<420?'warn':'ok'}
RD.gym=()=>{
  const k=td(),w=wdOf(k),g=gymGet(k),gd=cfg.gymDays.includes(w),opt=cfg.gym.opt[w]||'a',on=gymOptNames(w);
  const wkRows=WORD.map(d=>{
    const kd=dateOfWd(d),has=cfg.gymDays.includes(d),o=cfg.gym.opt[d]||'a',nm=gymOptNames(d);
    const di=has?dayItems(kd):null,gi=di&&di.items.find(x=>x.id==='gym');
    return '<tr><td class="b">'+DN[d]+(d===w?' <span class="pill">اليوم</span>':'')+'</td><td><input type="text" value="'+esc(cfg.split[d]||'')+'" data-c="split" data-w="'+d+'" style="min-width:110px"></td><td><input type="checkbox" data-c="gymday" data-w="'+d+'" '+(has?'checked':'')+' aria-label="جيم"></td><td>'+(has?'<select data-c="gymopt" data-w="'+d+'">'+opts([['a',nm.a],['b',nm.b]],o)+'</select>':'<span class="mut">راحة</span>')+'</td><td class="num">'+(gi?t12(gi.t0)+' – '+t12(gi.t1):'—')+'</td><td class="num '+(di?sleepClass(di.sleepMin):'')+'">'+(di?(di.sleepMin/60).toFixed(1)+' س':'—')+'</td></tr>';
  }).join('');
  const week=card('أسبوع الجيم','<div class="scx"><table class="tb"><thead><tr><th>اليوم</th><th>التمرين</th><th>جيم</th><th>الوقت</th><th>يبدأ وينتهي</th><th>نوم الليلة</th></tr></thead><tbody>'+wkRows+'</tbody></table></div><div class="mut sm" style="margin-top:8px">«نوم الليلة» يُحسب من آخر نشاط في اليوم حتى استيقاظ الغد.</div><div class="row" style="margin-top:8px"><label class="f">مدة التمرين (د)<input type="number" min="20" max="150" value="'+cfg.gym.dur+'" data-c="gymdur" style="width:96px"></label><label class="f">يبدأ إذا اخترت الأول<input type="time" value="'+esc(cfg.gym.t.a)+'" data-c="gymta"></label><label class="f">يبدأ إذا اخترت الثاني<input type="time" value="'+esc(cfg.gym.t.b)+'" data-c="gymtb"></label></div>',{cls:'full'});
  let cmp='';
  if(gd){
    const A1=dayItems(k,{gymOpt:'a'}),B1=dayItems(k,{gymOpt:'b'}),gA=A1.items.find(x=>x.id==='gym'),gB=B1.items.find(x=>x.id==='gym');
    const best=A1.sleepMin>=B1.sleepMin?'a':'b';
    cmp=card('أي وقت أنسب اليوم؟','<div class="grid w2"><div class="tile"><b>'+on.a+'</b><span>'+t12(gA.t0)+' – '+t12(gA.t1)+'</span><div class="'+sleepClass(A1.sleepMin)+' b" style="margin-top:4px">نوم '+(A1.sleepMin/60).toFixed(1)+' س</div>'+(gA.warn?'<div class="warn sm">'+gA.warn+'</div>':'')+'</div><div class="tile"><b>'+on.b+'</b><span>'+t12(gB.t0)+' – '+t12(gB.t1)+'</span><div class="'+sleepClass(B1.sleepMin)+' b" style="margin-top:4px">نوم '+(B1.sleepMin/60).toFixed(1)+' س</div></div></div><p style="margin:10px 0 0">'+(best==='a'?'الخيار «'+on.a+'» يمنحك نوماً أطول، وهو الأفضل لتركيزك وللتعافي بعد التمرين.':'الخيار «'+on.b+'» يمنحك نوماً أطول اليوم.')+' الحالي: <b>'+on[opt]+'</b>.</p>');
  }
  const rows=(g.rows||[]).map(r=>{const l=lastEx(r.ex,k);return '<li style="flex-wrap:wrap;align-items:flex-start"><div class="t" style="min-width:150px"><input type="text" list="exl" value="'+esc(r.ex)+'" data-i="gx" data-id="'+r.id+'" data-f="ex" placeholder="التمرين" style="width:100%">'+(l?'<div class="mut sm">آخر مرة: '+(l.s||'-')+'×'+(l.r||'-')+' @ '+(l.w||'-')+' كجم</div>':'')+'</div><input type="number" inputmode="numeric" placeholder="مجموعات" value="'+(r.s||'')+'" data-i="gx" data-id="'+r.id+'" data-f="s" style="width:76px"><input type="number" inputmode="numeric" placeholder="تكرار" value="'+(r.r||'')+'" data-i="gx" data-id="'+r.id+'" data-f="r" style="width:70px"><input type="number" inputmode="decimal" placeholder="كجم" value="'+(r.w||'')+'" data-i="gx" data-id="'+r.id+'" data-f="w" style="width:76px"><button class="x" data-a="gxdel" data-id="'+r.id+'" aria-label="حذف">×</button></li>'}).join('');
  const log=card('تمرين اليوم'+(gd?'':' (يوم راحة)'),'<label class="f">النوع<input type="text" value="'+esc(g.type||cfg.split[w]||'')+'" data-i="gtype" placeholder="مثال: صدر + ترايسبس"></label>'+
    (rows?'<ul class="list">'+rows+'</ul>':'<div class="empty">أضف أول تمرين من القائمة بالأسفل.</div>')+
    '<datalist id="exl">'+Object.values(EXG).flat().map(x=>'<option value="'+x+'">').join('')+'</datalist>'+
    '<div class="chips" style="margin:6px 0">'+Object.keys(EXG).map(x=>chip(x===exGrp,'data-a="exgrp" data-g="'+x+'"',x)).join('')+'</div>'+
    '<div class="chips">'+EXG[exGrp].map(x=>chip(0,'data-a="gxadd" data-x="'+x+'"','+ '+x)).join('')+chip(0,'data-a="gxadd" data-x=""','+ تمرين آخر')+'</div>'+
    '<label class="f" style="margin-top:10px">ملاحظات<textarea rows="2" data-i="gnote">'+esc(g.note||'')+'</textarea></label>'+
    '<div class="row" style="margin-top:10px"><button class="btn'+(g.done?' g':'')+'" data-a="gdone">'+(g.done?'ألغِ علامة الإنجاز':'أنهيت التمرين')+'</button></div>');
  const rest=card('مؤقت الراحة بين المجموعات','<div class="row"><button class="btn g" data-a="rest" data-s="45">45 ث</button><button class="btn g" data-a="rest" data-s="60">60 ث</button><button class="btn g" data-a="rest" data-s="90">90 ث</button><button class="btn g" data-a="rest" data-s="120">120 ث</button></div><div class="big-n ac" id="restn" style="margin-top:8px;text-align:center">'+(restLeft?fmtT(restLeft):'--:--')+'</div>');
  const bw=st.get('bw',{}),bws=Object.keys(bw).sort().slice(-30),lastW=bws.length?bw[bws[bws.length-1]]:'';
  let spark='';
  if(bws.length>1){const vs=bws.map(d=>bw[d]),mn=Math.min.apply(null,vs),mx=Math.max.apply(null,vs),rg=Math.max(.5,mx-mn);const pts=vs.map((v,i)=>(i/(vs.length-1)*280+10)+','+(60-((v-mn)/rg)*48-6)).join(' ');spark='<svg viewBox="0 0 300 66" style="width:100%;height:70px"><polyline points="'+pts+'" fill="none" stroke="var(--acc)" stroke-width="2.5" stroke-linejoin="round"/></svg><div class="row sp sm mut"><span>'+mn+' كجم</span><span>'+mx+' كجم</span></div>'}
  const allg=GYMS(),days=Object.keys(allg).filter(d=>allg[d].done).sort();
  const wk=ago(7).filter(d=>allg[d]&&allg[d].done).length;
  let streak=0;for(let i=0;i<30;i++){const d=addDays(k,-i),wd=wdOf(d);if(allg[d]&&allg[d].done)streak++;else if(cfg.gymDays.includes(wd)&&i>0)break}
  const pr={};Object.keys(allg).sort().forEach(d=>(allg[d].rows||[]).forEach(r=>{if(r.ex&&r.w&&(!pr[r.ex]||r.w>pr[r.ex].w))pr[r.ex]={w:+r.w,d:d}}));
  const prl=Object.keys(pr).sort((a,b)=>pr[b].d.localeCompare(pr[a].d)).slice(0,5);
  const prog=card('تقدّمك','<div class="tiles"><div class="tile"><b>'+wk+'/'+cfg.gymDays.length+'</b><span>تمارين هذا الأسبوع</span></div><div class="tile"><b>'+days.length+'</b><span>إجمالي التمارين</span></div><div class="tile"><b>'+streak+'</b><span>التزام متتالٍ</span></div></div>'+
    '<div class="row" style="margin:12px 0 4px"><label class="f">وزن الجسم اليوم (كجم)<input type="number" step="0.1" inputmode="decimal" id="bwin" value="'+(bw[k]||'')+'" style="width:130px"></label><button class="btn s" data-a="bwsave" style="align-self:flex-end">حفظ</button>'+(lastW?'<span class="mut sm" style="align-self:flex-end">آخر قياس '+lastW+' كجم</span>':'')+'</div>'+spark+
    (prl.length?'<div class="b" style="margin:10px 0 4px">أفضل أوزانك</div><ul class="list">'+prl.map(n=>'<li><span class="t">'+esc(n)+'</span><b class="ac num">'+pr[n].w+' كجم</b></li>').join('')+'</ul>':''));
  return '<div class="grid">'+(gd?'':card('اليوم راحة','<p>جسمك يبني العضل أثناء الراحة. امشِ 20 دقيقة أو مدّد جسمك، ونم جيداً.</p>',{cls:'full glow'}))+cmp+log+rest+prog+week+'</div>';
};
CHG.split=t=>{cfg.split[+t.dataset.w]=t.value;saveCfg()};
CHG.gymday=t=>{const w=+t.dataset.w,i=cfg.gymDays.indexOf(w);if(t.checked&&i<0)cfg.gymDays.push(w);if(!t.checked&&i>=0)cfg.gymDays.splice(i,1);saveCfg();renderSec('gym')};
CHG.gymopt=t=>{cfg.gym.opt[+t.dataset.w]=t.value;saveCfg();renderSec('gym')};
CHG.gymdur=t=>{cfg.gym.dur=clamp(parseInt(t.value,10)||70,20,150);saveCfg();renderSec('gym')};
CHG.gymta=t=>{cfg.gym.t.a=t.value;saveCfg();renderSec('gym')};
CHG.gymtb=t=>{cfg.gym.t.b=t.value;saveCfg();renderSec('gym')};
ACT.exgrp=t=>{exGrp=t.dataset.g;renderSec('gym')};
ACT.gxadd=t=>{const k=td(),g=gymGet(k);g.rows.push({id:uid(),ex:t.dataset.x||'',s:'',r:'',w:''});gymSet(k,g);renderSec('gym')};
ACT.gxdel=t=>{const k=td(),g=gymGet(k);g.rows=g.rows.filter(r=>r.id!==t.dataset.id);gymSet(k,g);renderSec('gym')};
INP.gx=t=>{const k=td(),g=gymGet(k),r=g.rows.find(x=>x.id===t.dataset.id);if(r){r[t.dataset.f]=t.value;gymSet(k,g)}};
INP.gtype=t=>{const k=td(),g=gymGet(k);g.type=t.value;gymSet(k,g)};
INP.gnote=t=>{const k=td(),g=gymGet(k);g.note=t.value;gymSet(k,g)};
ACT.gdone=()=>{const k=td(),g=gymGet(k);g.done=!g.done;gymSet(k,g);if(g.done)toast('أحسنت، تمرين مكتمل');renderSec('gym')};
ACT.bwsave=()=>{const v=num($('#bwin').value);if(!v)return;const a=st.get('bw',{});a[td()]=v;st.set('bw',a);renderSec('gym');toast('حُفظ الوزن')};
ACT.rest=t=>{clearInterval(restTm);restLeft=+t.dataset.s;const e=()=>{const n=$('#restn');if(n)n.textContent=restLeft>0?fmtT(restLeft):'انطلق'};e();restTm=setInterval(()=>{restLeft--;e();if(restLeft<=0){clearInterval(restTm);restLeft=0;try{ping()}catch(x){}toast('انتهت الراحة، المجموعة التالية')}},1000)};

/* ========== الأكل ========== */
const MEALS=[['bf','فطار',.25],['s1','سناك صباحي',.10],['ln','غداء',.30],['s2','سناك مساء',.10],['dn','عشاء',.25],['s3','قبل النوم',0]];
const FOODS=[['بيضة مسلوقة',78,6,0],['بيضة مقلية',95,6,0],['فول مدمس (طبق 150 جم)',165,12,0],['طعمية (قرص)',55,3,0],['عيش بلدي (نصف رغيف)',130,5,0],['عيش فينو (رغيف)',150,5,0],['جبنة قريش (100 جم)',98,11,0],['جبنة بيضاء (50 جم)',130,7,0],['لبن كامل (كوب)',150,8,0],['زبادي سادة (كوب)',95,5,0],['صدر فراخ مشوي (150 جم)',250,46,0],['فراخ مشوية (ورك 150 جم)',300,30,0],['كفتة مشوية (100 جم)',250,20,0],['سمك مشوي (150 جم)',200,33,0],['تونة (علبة)',110,24,0],['أرز مطبوخ (كوب)',205,4,0],['مكرونة مطبوخة (كوب)',220,8,0],['بطاطا مشوية (متوسطة)',115,2,0],['بطاطس مسلوقة (متوسطة)',130,3,0],['عدس مطبوخ (كوب)',230,18,0],['شوربة عدس (طبق)',150,8,0],['سلطة خضراء (طبق)',35,1,0],['خضار مطبوخة (طبق)',90,3,0],['ملوخية (طبق)',80,5,0],['كشري (طبق متوسط)',450,13,3],['تمر (3 حبات)',70,1,0],['موزة',105,1,0],['تفاحة',95,0,0],['برتقالة',62,1,0],['جوافة',60,3,0],['مكسرات (حفنة 30 جم)',180,5,0],['فول سوداني (حفنة)',170,8,0],['شوفان (نصف كوب جاف)',150,5,0],['ملعقة عسل',21,0,6],['ملعقة زيت',120,0,0],['شاي أخضر',2,0,0],['بسكويت (قطعتان)',100,1,8],['شوكولاتة (مربعان)',110,1,10],['مشروب غازي (علبة)',140,0,35],['عصير معبأ (كوب)',110,0,22]];
const allFoods=()=>FOODS.concat((st.get('myfoods',[])).map(x=>[x.n,x.k,x.p,x.s]));
const FOODL=()=>st.get('food',{});
let fsh={meal:'bf',q:'',qty:1};
function sugarStreak(){let n=0;for(let i=0;i<60;i++){const d=addDays(td(),-i),f=foodTotals(d);if(f.kcal===0&&i===0)continue;if(f.kcal>0&&f.sugar<=cfg.sugar)n++;else break}return n}
RD.food=()=>{
  const k=td(),f=foodTotals(k),lim=cfg.kcal,rem=lim-f.kcal,ents=D.food(k),c=D.caf(k);
  const over=f.kcal>lim;
  const top=card('سعرات اليوم','<div class="row" style="gap:18px;align-items:center"><div style="width:120px">'+ring(f.kcal/lim,f.kcal,'','',over?'#e8806a':'#b7d68b')+'</div><div class="grow"><div class="big-n '+(over?'bad':'ok')+'">'+(over?'+'+(-rem):rem)+'</div><div class="mut">'+(over?'سعرة فوق الحد':'سعرة متبقية')+' من '+lim+'</div></div></div>'+
    '<div class="b" style="margin:12px 0 6px">حد السعرات</div><div class="chips">'+[1200,1500].map(v=>chip(cfg.kcal===v,'data-a="kcal" data-v="'+v+'"',v)).join('')+'<input type="number" min="1000" max="4000" value="'+(cfg.kcal!==1200&&cfg.kcal!==1500?cfg.kcal:'')+'" placeholder="مخصص" data-c="kcalc" style="width:100px"></div>'+
    (cfg.kcal<1400?'<p class="warn sm" style="margin:8px 0 0">1200 سعرة أقل من احتياج أغلب طلاب الثانوية الذين يتمرنون بانتظام. إن شعرت بدوار أو إرهاق أو ضعف تركيز فارفع الحد أو استشر طبيباً.</p>':'')+
    '<div class="row sp sm" style="margin-top:12px"><span>البروتين</span><span class="num">'+f.protein+' / '+cfg.protein+' جم</span></div>'+bar(f.protein/cfg.protein)+
    '<div class="row sp sm"><span>السكر المضاف</span><span class="num '+(f.sugar>cfg.sugar?'bad':'ok')+'">'+f.sugar+' / '+cfg.sugar+' جم</span></div>'+bar(f.sugar/cfg.sugar,f.sugar>cfg.sugar?'b':f.sugar>cfg.sugar*.7?'w':'')+
    '<div class="mut sm">أيام متتالية دون تجاوز حد السكر: <b class="ac">'+sugarStreak()+'</b></div>');
  const meals=MEALS.map(m=>{
    const es=ents.filter(e=>e.m===m[0]),kc=sum(es.map(e=>e.k||0)),bud=Math.round(lim*m[2]);
    return '<div style="border-top:1px solid var(--line);padding:10px 0"><div class="row sp"><b>'+m[1]+'</b><span class="mut sm num">'+kc+(bud?' / '+bud:'')+' سعرة</span><button class="btn s" data-a="foodadd" data-m="'+m[0]+'">+ إضافة</button></div>'+
      (es.length?'<ul class="list">'+es.map(e=>'<li><span class="t">'+esc(e.x)+'</span><span class="mut sm num">'+e.k+'</span>'+(e.s?'<span class="pill c" style="--c:#e8806a">سكر '+e.s+'</span>':'')+'<button class="x" data-a="fooddel" data-id="'+e.id+'" aria-label="حذف">×</button></li>').join('')+'</ul>':'')+'</div>';
  }).join('');
  const dr=f.drinkKcal?'<div class="mut sm" style="border-top:1px solid var(--line);padding-top:8px">سكر المشروبات من قسم الماء: '+f.drinkSugar+' جم · '+f.drinkKcal+' سعرة (محتسبة)</div>':'';
  const mc=card('وجبات اليوم',meals+dr,{cls:'full'});
  const wk=ago(7).map(d=>{const t=foodTotals(d);return{l:DN[wdOf(d)].slice(0,3),v:t.kcal,c:t.kcal>lim?'#e8806a':'#b7d68b'}});
  const avg=Math.round(sum(wk.map(x=>x.v))/Math.max(1,wk.filter(x=>x.v).length));
  const chart=card('آخر 7 أيام',bars(wk)+'<div class="mut sm">المتوسط '+avg+' سعرة. الأخضر ضمن الحد والأحمر فوقه.</div>');
  const tips=card('لتقليل السكر','<ul class="list"><li><span class="t">بدّل المشروب الغازي بماء بنكهة الليمون أو النعناع.</span></li><li><span class="t">الشاي والقهوة بنصف الملعقة ثم بدونها تدريجياً.</span></li><li><span class="t">الفاكهة الكاملة أفضل من العصير المعبأ.</span></li><li><span class="t">اقرأ ملصق المنتج: كل 4 جم سكر تساوي ملعقة صغيرة.</span></li></ul>');
  return '<div class="grid">'+top+chart+mc+tips+'</div>';
};
ACT.kcal=t=>{cfg.kcal=+t.dataset.v;saveCfg();renderSec('food')};
CHG.kcalc=t=>{const v=parseInt(t.value,10);if(v>=1000&&v<=4000){cfg.kcal=v;saveCfg();renderSec('food')}};
function foodList(){
  const q=fsh.q.trim(),a=allFoods().map((x,i)=>({x:x,i:i})).filter(o=>!q||o.x[0].includes(q));
  return a.slice(0,40).map(o=>'<li data-a="foodpick" data-i="'+o.i+'" style="cursor:pointer"><span class="t">'+esc(o.x[0])+'</span><span class="mut sm num">'+Math.round(o.x[1]*fsh.qty)+' سعرة'+(o.x[3]?' · سكر '+Math.round(o.x[3]*fsh.qty):'')+'</span></li>').join('')||'<li class="mut">لا نتائج. أضفه يدوياً بالأسفل.</li>';
}
ACT.foodadd=t=>{
  fsh={meal:t.dataset.m,q:'',qty:1};const mn=MEALS.find(m=>m[0]===fsh.meal)[1];
  sheet('<h3>إضافة إلى '+mn+'</h3><input type="search" placeholder="ابحث عن طعام" data-i="foodq" style="width:100%"><div class="row" style="margin:8px 0"><span class="sm mut">الكمية</span>'+[.5,1,1.5,2].map(v=>chip(v===1,'data-a="fqty" data-v="'+v+'"','×'+v)).join('')+'</div><ul class="list" id="fl" style="max-height:34vh;overflow:auto">'+foodList()+'</ul>'+
    '<div class="b" style="margin:10px 0 6px">أو أضفه يدوياً</div><div class="row"><input type="text" id="cf_n" placeholder="الاسم" class="grow"><input type="number" id="cf_k" placeholder="سعرات" style="width:90px"><input type="number" id="cf_p" placeholder="بروتين" style="width:84px"><input type="number" id="cf_s" placeholder="سكر مضاف" style="width:96px"></div><div class="row" style="margin-top:8px"><label class="row sm"><input type="checkbox" id="cf_save"> احفظه في قائمتي</label><button class="btn" data-a="foodcustom">أضف</button></div>');
};
INP.foodq=t=>{fsh.q=t.value;$('#fl').innerHTML=foodList()};
ACT.fqty=t=>{fsh.qty=+t.dataset.v;$$('[data-a=fqty]').forEach(b=>b.classList.toggle('on',b===t));$('#fl').innerHTML=foodList()};
function addFood(e){const a=FOODL(),k=td();a[k]=a[k]||[];a[k].push(Object.assign({id:uid(),m:fsh.meal,at:Date.now()},e));st.set('food',a)}
ACT.foodpick=t=>{const x=allFoods()[+t.dataset.i];if(!x)return;const q=fsh.qty;addFood({x:x[0]+(q!==1?' ×'+q:''),k:Math.round(x[1]*q),p:Math.round(x[2]*q),s:Math.round(x[3]*q*10)/10});closeSheet();renderSec('food');toast('أُضيف')};
ACT.foodcustom=()=>{
  const n=$('#cf_n').value.trim(),kk=num($('#cf_k').value);if(!n||!kk){toast('اكتب الاسم والسعرات');return}
  const p=num($('#cf_p').value),s=num($('#cf_s').value);addFood({x:n,k:Math.round(kk),p:Math.round(p),s:s});
  if($('#cf_save').checked){const m=st.get('myfoods',[]);m.push({n:n,k:Math.round(kk),p:Math.round(p),s:s});st.set('myfoods',m)}
  closeSheet();renderSec('food');
};
ACT.fooddel=t=>{const a=FOODL(),k=td();a[k]=(a[k]||[]).filter(e=>e.id!==t.dataset.id);st.set('food',a);renderSec('food')};
