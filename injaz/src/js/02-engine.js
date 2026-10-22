/* ========== محرّك الجدول اليومي ========== */
function morning(k){
  const w=wdOf(k),win=winOf(w),S=pm(win[0]),E=pm(win[1]),F=cfg.focus,B=cfg.brk,P=prayers(k).fajr,out=[],pl=planOf(w);let idx=0;
  const fill=(x,y)=>{let t=x;while(y-t>=25){const e=Math.min(t+F,y);out.push({type:'focus',i:idx,s:t,e:e,subj:pl[idx%pl.length]});idx++;t=e+B}};
  if(P>=S&&P<E-20){fill(S,P-5);out.push({type:'pray',s:P,e:P+20});fill(P+20,E)}else fill(S,E);
  return out;
}
function slotFree(items,from,len,to){
  const busy=items.filter(x=>x.tag!=='pray'&&x.t1>x.t0).sort((a,b)=>a.t0-b.t0);let t=from;
  for(const x of busy){if(x.t1<=t)continue;if(x.t0-5>=t+len)break;t=Math.max(t,x.t1+5)}
  return t+len<=to?t:null;
}
const lessonish=w=>cfg.arabic.days.includes(w)||cfg.prog.days.includes(w);
const gymOptNames=w=>lessonish(w)?{a:'بعد 3 م',b:'بعد 9 م'}:{a:'بعد الغروب',b:'بعد العشاء'};
function dayItems(k,o){
  o=o||{};const w=wdOf(k),P=prayers(k),it=[];
  const add=(id,t0,t1,label,tag,x)=>{const r=Object.assign({id:id,t0:t0,t1:t1==null?t0:t1,label:label,tag:tag},x||{});it.push(r);return r};
  const win=winOf(w),S=pm(win[0]),E=pm(win[1]),wake=S-10;
  add('wake',wake,S,'الاستيقاظ والماء والوضوء','rest');
  let hasF=false;
  morning(k).forEach(x=>{if(x.type==='focus')add('m'+x.i,x.s,x.e,'مذاكرة: '+sub(x.subj).n,'study',{subj:x.subj,bi:x.i});else{hasF=true;add('fajr',x.s,x.e,'صلاة الفجر وأذكار الصباح','pray')}});
  if(!hasF)add('fajr',P.fajr,P.fajr+15,'صلاة الفجر وأذكار الصباح','pray');
  add('bf',E+5,E+35,'فطار','food');
  const sch=cfg.school.on&&cfg.school.days.includes(w);
  if(sch)add('school',pm(cfg.school.from),pm(cfg.school.to),'المدرسة','school');
  const fri=w===5;
  add('dhuhr',P.dhuhr,P.dhuhr+(fri?60:10),fri?'صلاة الجمعة':'صلاة الظهر','pray');
  add('asr',P.asr,P.asr+10,'صلاة العصر','pray');
  add('mag',P.maghrib,P.maghrib+10,'صلاة المغرب','pray');
  add('isha',P.isha,P.isha+10,'صلاة العشاء','pray');
  let lunchT=Math.max(P.dhuhr+(fri?70:20),13*60);if(sch)lunchT=Math.max(lunchT,pm(cfg.school.to)+10);
  add('ln',lunchT,lunchT+35,'غداء','food');
  let arEnd=0,pgEnd=0,home=0,pgStart=0;
  if(cfg.arabic.days.includes(w)){const t=pm(cfg.arabic.time);arEnd=t+cfg.arabic.dur;add('ar',t,arEnd,cfg.arabic.name||'الدرس الأول','lesson')}
  if(cfg.prog.days.includes(w)){const t=pm(cfg.prog.time),tr=cfg.prog.trav;pgStart=t;pgEnd=t+cfg.prog.dur;home=pgEnd+tr;
    add('pgo',t-tr,t,'الذهاب إلى: '+(cfg.prog.name||'الدرس الثاني'),'move');add('pg',t,pgEnd,cfg.prog.name||'الدرس الثاني','lesson');add('pgb',pgEnd,home,'العودة إلى البيت','move')}
  if(cfg.eng.on&&cfg.eng.days.includes(w)){const t=pm(cfg.eng.time);add('en',t,t+cfg.eng.dur,(cfg.eng.name||'حصة أونلاين'),'study',{subj:'en'})}
  const dinT=pgEnd?home+5:pm(cfg.dinner);
  add('dn',dinT,dinT+35,'عشاء','food');
  const opt=o.gymOpt||cfg.gym.opt[w]||'a';
  if(o.gymOpt!=='off'&&cfg.gymDays.includes(w)){
    let g0;
    if(lessonish(w))g0=opt==='a'?Math.max(15*60,arEnd?arEnd+20:0):Math.max(21*60,dinT+35+20);
    else g0=opt==='a'?P.maghrib+15:dinT+35+60;
    const ov=cfg.gym.t&&cfg.gym.t[opt];if(ov)g0=pm(ov);
    const g1=g0+cfg.gym.dur;
    const tight=opt==='a'&&pgStart&&(g1+20>pgStart-cfg.prog.trav);
    add('gym',g0,g1,'الجيم: '+(cfg.split[w]||'تمرين'),'gym',{opt:opt,warn:tight?'الوقت ضيق قبل الانتقال لدرس البرمجة':''});
    add('pgym',g1,g1+20,opt==='a'?'استحمام ووجبة خفيفة':'استحمام وتهدئة','food');
  }else if(!cfg.gymDays.includes(w)||o.gymOpt==='off'){
    const t=slotFree(it,P.asr+15,25,19*60);if(t!=null)add('walk',t,t+25,'مشي خفيف (راحة نشطة)','rest');
  }
  const nap=slotFree(it,lunchT+40,25,16*60);if(nap!=null)add('nap',nap,nap+25,'قيلولة قصيرة','rest');
  const target=cfg.read.target,pos=cfg.read.pos;
  const order=pos==='morning'?[[E+50,P.dhuhr-10],[P.asr+15,20*60],[19*60,22*60]]:pos==='afternoon'?[[P.asr+15,20*60],[E+50,P.dhuhr-10],[19*60,22*60]]:[[19*60,22*60+30],[E+50,P.dhuhr-10],[P.asr+15,20*60]];
  let r=null;for(const rr of order){r=slotFree(it,rr[0],target,rr[1]);if(r!=null)break}
  if(r!=null)add('rd',r,r+target,'قراءة كتاب خارجي','read');
  if(fri){const t=slotFree(it,P.asr+15,30,20*60);if(t!=null)add('wr',t,t+30,'مراجعة الأسبوع وتخطيط القادم','study')}
  (st.get('rtc',[])).forEach(c=>{if((c.days||[]).includes(w)){const t=pm(c.t);add('c'+c.id,t,t+(c.len||0),c.label,c.tag||'custom',{custom:c.id})}});
  const hidden=st.get('rthide',[]);
  const items=it.filter(x=>!hidden.includes(x.id));
  const lastEnd=Math.max.apply(null,items.map(x=>x.t1));
  const bed=Math.max(pm(cfg.sleep.bed),lastEnd+30);
  const nw=pm(winOf((w+1)%7)[0])-10;
  const sleepMin=1440+nw-bed;
  items.push({id:'sleep',t0:bed,t1:bed+30,label:'النوم',tag:'sleep'});
  items.sort((a,b)=>a.t0-b.t0||a.t1-b.t1);
  const ign=['pray','rest','sleep'];
  items.forEach(a=>{a.cf=items.some(b=>b!==a&&!ign.includes(a.tag)&&!ign.includes(b.tag)&&a.t0<b.t1&&b.t0<a.t1&&b.t1>b.t0&&a.t1>a.t0)});
  return{items:items,bed:bed,sleepMin:sleepMin,wakeNext:nw};
}
function nowNext(items,nm){
  let cur=null,next=null;
  items.forEach(x=>{if(x.t0<=nm&&nm<Math.max(x.t1,x.t0+1)&&x.tag!=='sleep')cur=x});
  for(const x of items){if(x.t0>nm){next=x;break}}
  return{cur:cur,next:next};
}
const rtDone=k=>st.get('rtdone',{})[k]||{};
function setRtDone(k,id,v){const a=st.get('rtdone',{});a[k]=a[k]||{};if(v)a[k][id]=1;else delete a[k][id];st.set('rtdone',a)}
const TAGN={study:'مذاكرة',pray:'عبادة',lesson:'درس',gym:'تمرين',food:'أكل',rest:'راحة',read:'قراءة',sleep:'نوم',move:'تنقّل',school:'مدرسة',custom:'خاص'};
