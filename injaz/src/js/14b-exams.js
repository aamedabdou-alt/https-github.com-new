/* ========== الامتحانات والتقييمات ========== */
const BANK_ALIAS={bioA:['bio'],chemA:['chem'],physA:['phys'],mathA:['math'],isci:['phys','chem','bio'],calc:['math'],alg:['math'],stc:['phys'],dyn:['phys'],prog:[],ecoA:['eco'],geoA:['geo'],ehist:['hist']};
const BAND_FALL={p13:['p13','p46'],p46:['p46','prep'],prep:['prep','p46','sec'],sec:['sec','prep']};
let XREMOTE=[];
function loadRemoteBank(){
  try{XREMOTE=(st.get('xbank',[])||[]).filter(validQ)}catch(e){XREMOTE=[]}
  if(!navigator.onLine||!/^https?:$/.test(location.protocol))return;
  fetch('exams/bank.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
    if(!Array.isArray(j))return;const ok=j.filter(validQ).slice(0,3000);
    if(ok.length){XREMOTE=ok;st.set('xbank',ok)}
  }).catch(()=>{});
}
const validQ=q=>Array.isArray(q)&&q.length>=6&&typeof q[0]==='string'&&typeof q[1]==='string'&&typeof q[2]==='string'&&Array.isArray(q[3])&&q[3].length>=2&&q[3].length<=5&&q[3].every(x=>typeof x==='string')&&Number.isInteger(q[4])&&q[4]>=0&&q[4]<q[3].length&&typeof q[5]==='string';
const allBank=()=>BANK0.concat(XREMOTE);
const qid=q=>{let h=5381;const s=q[0]+q[1]+q[2];for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 'q'+(h>>>0).toString(36)};
function examBand(){const e=eduOf();if(!e)return 'prep';if(e.stage==='prim')return +e.grade<=3?'p13':'p46';if(e.stage==='prep')return 'prep';return 'sec'}
function poolFor(subjKey,band){
  const keys=BANK_ALIAS[subjKey]!==undefined?BANK_ALIAS[subjKey]:[subjKey];
  const bands=BAND_FALL[band]||[band];
  for(const b of bands){const p=allBank().filter(q=>keys.includes(q[0])&&q[1]===b);if(p.length)return p}
  return [];
}
const examSubjects=()=>mySubs().filter(s=>poolFor(s.k,examBand()).length);
function rng(seed){let a=0;for(let i=0;i<seed.length;i++)a=(a*31+seed.charCodeAt(i))|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuf(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function weekId(){const d=Math.floor((Date.now()+3*3600e3)/864e5);return 'w'+Math.floor((d-2)/7)}
function weekLabel(){const d=Math.floor((Date.now()+3*3600e3)/864e5),s=d-((d-2)%7+7)%7;return new Date(s*864e5).toLocaleDateString('ar-EG',{day:'numeric',month:'long',timeZone:'UTC'})}
function buildQs(subjs,n,seed){
  const r=rng(seed),band=examBand(),pools=subjs.map(s=>({s:s,p:shuf(poolFor(s.k,band),r)})),out=[];let i=0,guard=0;
  while(out.length<n&&guard++<500){const x=pools[i%pools.length];i++;const q=x.p.shift();if(q&&!out.find(o=>o.id===qid(q)))out.push({id:qid(q),s:x.s.k,sn:x.s.n,q:q[2],o:q[3],a:q[4],e:q[5]});if(pools.every(z=>!z.p.length))break}
  return shuf(out,r);
}
const XH=()=>st.get('xhist',[]);
const saveXH=a=>st.set('xhist',a.slice(-120));
const EX={on:false,qs:[],i:0,ans:[],done:false,meta:null};
function exStart(qs,meta){if(!qs.length){toast('لا توجد أسئلة متاحة لهذه المادة بعد');return}EX.on=true;EX.qs=qs;EX.i=0;EX.ans=new Array(qs.length).fill(-1);EX.done=false;EX.meta=meta;EX.t0=Date.now();renderSec('exam')}
ACT.exweek=()=>{
  const subs=examSubjects();if(!subs.length){toast('اختر مرحلتك أولاً من الإعدادات');return}
  exStart(buildQs(subs,10,weekId()+'|'+(userName()||me())),{type:'week',wk:weekId(),title:'امتحان الأسبوع'});
};
ACT.exprac=t=>{const s=mySubs().find(x=>x.k===t.dataset.k);if(!s)return;exStart(buildQs([s],10,'p'+Date.now()),{type:'prac',subj:s.k,title:'تدريب: '+s.n})};
ACT.exmix=()=>{const subs=examSubjects();if(!subs.length){toast('اختر مرحلتك أولاً');return}exStart(buildQs(subs,10,'m'+Date.now()),{type:'mix',title:'تدريب متنوع'})};
ACT.exans=t=>{if(EX.done)return;EX.ans[EX.i]=+t.dataset.i;renderSec('exam')};
ACT.exnext=()=>{if(EX.i<EX.qs.length-1){EX.i++;renderSec('exam')}};
ACT.exprev=()=>{if(EX.i>0){EX.i--;renderSec('exam')}};
ACT.exgo=t=>{EX.i=+t.dataset.i;renderSec('exam')};
ACT.exquit=()=>ask('إنهاء الامتحان بلا حفظ النتيجة؟','إنهاء',()=>{EX.on=false;renderSec('exam')},true);
ACT.exfinish=()=>{
  const un=EX.ans.filter(x=>x<0).length;
  const fin=()=>{
    const items=EX.qs.map((q,i)=>({id:q.id,s:q.s,ok:EX.ans[i]===q.a}));
    const score=items.filter(x=>x.ok).length,h=XH();
    const first=EX.meta.type==='week'&&!h.some(x=>x.type==='week'&&x.wk===EX.meta.wk);
    h.push({at:Date.now(),type:EX.meta.type,wk:EX.meta.wk||'',subj:EX.meta.subj||'',score:score,total:EX.qs.length,off:first||EX.meta.type!=='week',items:items,mins:Math.round((Date.now()-EX.t0)/60000)});
    saveXH(h);EX.done=true;EX.i=0;renderSec('exam');
  };
  if(un)ask('بقيت '+un+' أسئلة بلا إجابة. إنهاء الامتحان؟','إنهاء',fin);else fin();
};
ACT.exclose=()=>{EX.on=false;renderSec('exam')};
ACT.exnew=()=>{EX.on=false;renderSec('exam')};
function weekResult(){return XH().filter(x=>x.type==='week'&&x.wk===weekId()).sort((a,b)=>a.at-b.at)[0]||null}
function pctOf(h){return h.total?Math.round(h.score/h.total*100):0}
function grade(p){return p>=90?'ممتاز':p>=75?'جيد جداً':p>=60?'جيد':p>=50?'مقبول':'يحتاج مراجعة'}
function weakSubjects(){
  const h=XH(),m={};h.forEach(x=>x.items.forEach(i=>{(m[i.s]=m[i.s]||{o:0,t:0});m[i.s].t++;if(i.ok)m[i.s].o++}));
  return Object.keys(m).map(k=>({k:k,p:Math.round(m[k].o/m[k].t*100),t:m[k].t})).filter(x=>x.t>=3).sort((a,b)=>a.p-b.p);
}
function exQuestion(){
  const q=EX.qs[EX.i],ans=EX.ans[EX.i],n=EX.qs.length;
  const nav='<div class="exdots">'+EX.qs.map((_,i)=>'<button class="exd'+(i===EX.i?' cur':'')+(EX.ans[i]>=0?' ans':'')+'" data-a="exgo" data-i="'+i+'" aria-label="سؤال '+(i+1)+'">'+(i+1)+'</button>').join('')+'</div>';
  return '<div class="card"><h3><span>'+esc(EX.meta.title)+'</span><small>'+(EX.i+1)+' من '+n+'</small></h3>'+bar((EX.i+1)/n)+nav+
    '<div class="mut sm" style="margin-top:10px">'+esc(q.sn)+'</div><div class="exq">'+esc(q.q)+'</div><div class="exopts">'+
    q.o.map((o,i)=>'<button class="opt'+(ans===i?' sel':'')+'" data-a="exans" data-i="'+i+'">'+esc(o)+'</button>').join('')+'</div>'+
    '<div class="row" style="margin-top:12px"><button class="btn g" data-a="exprev"'+(EX.i?'':' disabled')+'>السابق</button>'+
    (EX.i<n-1?'<button class="btn" data-a="exnext">التالي</button>':'<button class="btn" data-a="exfinish">إنهاء وتصحيح</button>')+
    '<button class="btn d s" data-a="exquit">خروج</button></div></div>';
}
function exResult(){
  const items=EX.qs.map((q,i)=>({q:q,a:EX.ans[i]})),score=items.filter(x=>x.a===x.q.a).length,p=Math.round(score/EX.qs.length*100);
  return '<div class="card glow"><h3><span>النتيجة</span><small>'+esc(EX.meta.title)+'</small></h3><div class="exscore">'+score+' من '+EX.qs.length+'</div><div class="b" style="text-align:center">'+p+'% · '+grade(p)+'</div>'+
    '<div class="row" style="justify-content:center;margin-top:10px"><button class="btn" data-a="exnew">رجوع للامتحانات</button></div></div>'+
    '<div class="card" style="margin-top:12px"><h3>الحلول والشرح</h3>'+items.map((x,i)=>{const ok=x.a===x.q.a;
      return '<div class="exrev '+(ok?'ok':'no')+'"><div class="mut sm">'+(i+1)+'. '+esc(x.q.sn)+' · '+(ok?'إجابة صحيحة':x.a<0?'بلا إجابة':'إجابة خاطئة')+'</div><div class="b">'+esc(x.q.q)+'</div>'+
      (ok?'':'<div class="sm">إجابتك: '+(x.a<0?'—':esc(x.q.o[x.a]))+'</div>')+'<div class="sm">الصحيح: <b>'+esc(x.q.o[x.q.a])+'</b></div><div class="mut sm">'+esc(x.q.e)+'</div></div>'}).join('')+'</div>';
}
function exHistory(){
  const h=XH().slice().reverse().slice(0,12),w=weakSubjects();
  const avg=h.length?Math.round(h.reduce((s,x)=>s+pctOf(x),0)/h.length):0;
  return card('سجلي',(h.length?'<div class="mut sm">المتوسط في آخر '+h.length+' اختباراً: <b>'+avg+'%</b></div>':'<div class="empty">لا نتائج بعد. ابدأ بامتحان الأسبوع.</div>')+
    (w.length?'<div class="mut sm" style="margin-top:8px">نقاط تحتاج مراجعة:</div><div class="chips" style="flex-wrap:wrap">'+w.slice(0,4).map(x=>'<span class="chip">'+esc(sub(x.k).n)+' · '+x.p+'%</span>').join('')+'</div>':'')+
    (h.length?'<ul class="list" style="margin-top:8px">'+h.map(x=>'<li><span class="t">'+esc(x.type==='week'?'امتحان الأسبوع':x.type==='prac'?'تدريب: '+sub(x.subj).n:'تدريب متنوع')+'</span><small class="mut">'+new Date(x.at).toLocaleDateString('ar-EG',{day:'numeric',month:'short'})+' · '+x.score+' من '+x.total+'</small></li>').join('')+'</ul>':''));
}
RD.exam=()=>{
  if(EX.on)return EX.done?exResult():exQuestion();
  const e=eduOf();if(!e)return card('اختر مرحلتك','<p class="mut">حتى نجهّز لك امتحانات مواد مرحلتك.</p><button class="btn" data-a="edusheet">اختيار المرحلة</button>');
  const subs=examSubjects(),wr=weekResult();
  const wk=card('امتحان الأسبوع','<p class="mut sm">أسبوع '+weekLabel()+' · '+esc(eduLabel())+'. عشرة أسئلة من موادك، ويتجدد كل سبت.</p>'+
    (wr?'<div class="exscore" style="font-size:1.6rem">'+wr.score+' من '+wr.total+'</div><div class="mut sm" style="text-align:center">'+grade(pctOf(wr))+' · نتيجتك الرسمية لهذا الأسبوع</div><div class="row" style="margin-top:10px"><button class="btn g" data-a="exweek">إعادة للتدريب</button></div>':'<div class="row"><button class="btn" data-a="exweek">ابدأ امتحان الأسبوع</button></div>'),{cls:'glow'});
  const pr=card('تدريب حسب المادة',subs.length?'<div class="chips" style="flex-wrap:wrap">'+subs.map(s=>'<button class="chip" data-a="exprac" data-k="'+s.k+'" style="--c:'+s.c+'">'+esc(s.n)+'</button>').join('')+'</div><div class="row" style="margin-top:10px"><button class="btn g" data-a="exmix">تدريب متنوع</button></div>':'<div class="empty">لا أسئلة لمواد مرحلتك بعد. تُضاف باستمرار.</div>');
  const miss=mySubs().filter(s=>!subs.find(x=>x.k===s.k));
  const note='<p class="mut sm" style="margin-top:12px">تدريبات من إعداد التطبيق للمراجعة، وليست امتحانات الوزارة ولا نسخاً منها. '+(miss.length?'مواد لم تُضف أسئلتها بعد: '+miss.map(s=>esc(s.n)).join('، ')+'.':'')+'</p>';
  return '<div class="grid">'+wk+pr+exHistory()+'</div>'+note;
};
PO.exam=()=>{};
