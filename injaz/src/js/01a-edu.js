/* ========== التعليم المصري: المراحل والصفوف والمسارات والمواد ========== */
const PAL=['#c8a27a','#8fb3ff','#7fb29a','#7fbfae','#d98c5f','#b8a5ff','#e8a1c9','#e6c36a','#8ad0d6','#e08f9a','#a3c97a','#9aa8e8'];
const S=(k,n)=>({k:k,n:n});
const C={
  ar:S('ar','اللغة العربية'),en:S('en','اللغة الإنجليزية'),l2:S('l2','لغة أجنبية ثانية'),math:S('math','الرياضيات'),
  sci:S('sci','العلوم'),isci:S('isci','العلوم المتكاملة'),soc:S('soc','الدراسات الاجتماعية'),rel:S('rel','التربية الدينية'),
  comp:S('comp','الحاسب الآلي'),art:S('art','التربية الفنية'),mus:S('mus','التربية الموسيقية'),pe:S('pe','التربية الرياضية'),
  val:S('val','القيم واحترام الآخر'),hist:S('hist','التاريخ'),geo:S('geo','الجغرافيا'),phil:S('phil','الفلسفة والمنطق'),
  psy:S('psy','علم النفس والاجتماع'),stat:S('stat','الإحصاء'),bio:S('bio','الأحياء'),chem:S('chem','الكيمياء'),phys:S('phys','الفيزياء'),
  geol:S('geol','الجيولوجيا'),alg:S('alg','الجبر والهندسة الفراغية'),calc:S('calc','التفاضل والتكامل'),stc:S('stc','الاستاتيكا'),dyn:S('dyn','الديناميكا'),
  ehist:S('ehist','التاريخ المصري'),fin:S('fin','الثقافة المالية'),prog:S('prog','البرمجة والذكاء الاصطناعي'),acc:S('acc','المحاسبة'),
  biz:S('biz','إدارة الأعمال'),eco:S('eco','الاقتصاد'),
  bioA:S('bioA','الأحياء (متقدم)'),chemA:S('chemA','الكيمياء (متقدم)'),mathA:S('mathA','الرياضيات (متقدم)'),physA:S('physA','الفيزياء (متقدم)'),
  ecoA:S('ecoA','الاقتصاد (متقدم)'),geoA:S('geoA','الجغرافيا (متقدم)')
};
const G_AR=['الأول','الثاني','الثالث','الرابع','الخامس','السادس'];
const EDU={
  prim:{n:'المرحلة الابتدائية',g:[1,2,3,4,5,6],gn:g=>'الصف '+G_AR[g-1]+' الابتدائي'},
  prep:{n:'المرحلة الإعدادية',g:[1,2,3],gn:g=>'الصف '+G_AR[g-1]+' الإعدادي'},
  sec:{n:'الثانوية العامة',g:[1,2,3],gn:g=>(g===1?'الأول':g===2?'الثاني':'الثالث')+' الثانوي'},
  bac:{n:'البكالوريا المصرية',g:[1,2,3],gn:g=>(g===1?'الأولى':g===2?'الثانية':'الثالثة')+' بكالوريا'}
};
const TRACKS={
  sec:{sci:'علمي علوم',math:'علمي رياضة',lit:'أدبي'},
  bac:{med:'الطب وعلوم الحياة',eng:'الهندسة وعلوم الحاسب',biz:'الأعمال',art:'الآداب والفنون'}
};
function eduSubjects(e){
  if(!e||!e.stage)return [];
  const st=e.stage,g=+e.grade,t=e.track;let L=[];
  if(st==='prim'){
    L=g<=3?[C.ar,C.math,C.en,C.rel,C.val,C.art,C.mus,C.pe]:[C.ar,C.math,C.en,C.sci,C.soc,C.rel,C.comp,C.art,C.pe];
  }else if(st==='prep'){
    L=[C.ar,C.en,C.math,C.sci,C.soc,C.l2,C.rel,C.comp,C.art,C.pe];
  }else if(st==='sec'){
    if(g===1)L=[C.ar,C.en,C.l2,C.math,C.isci,C.hist,C.geo,C.rel,C.comp,C.pe];
    else if(t==='lit')L=[C.ar,C.en,C.l2,C.hist,C.geo,C.phil,C.psy,C.stat,C.rel];
    else if(t==='math')L=g===2?[C.ar,C.en,C.l2,C.alg,C.calc,C.stc,C.dyn,C.phys,C.chem,C.rel]:[C.ar,C.en,C.l2,C.alg,C.calc,C.stc,C.dyn,C.phys,C.chem,C.rel];
    else L=g===2?[C.ar,C.en,C.l2,C.bio,C.chem,C.phys,C.math,C.rel]:[C.ar,C.en,C.l2,C.bio,C.chem,C.phys,C.geol,C.rel];
  }else if(st==='bac'){
    if(g===1)L=[C.ar,C.en,C.l2,C.math,C.isci,C.ehist,C.prog,C.rel,C.fin,C.pe];
    else if(g===2){
      L=[C.ar,C.en,C.ehist];
      const x={med:[C.math,C.phys],eng:[C.chem,C.prog],biz:[C.acc,C.biz],art:[C.psy,C.l2]}[t]||[];
      L=L.concat(x,[C.fin,C.pe]);
    }else{
      const x={med:[C.bioA,C.chemA],eng:[C.mathA,C.physA],biz:[C.ecoA,C.math],art:[C.geoA,C.stat]}[t]||[];
      L=x.concat([C.rel]);
    }
  }
  return L.map((s,i)=>Object.assign({c:PAL[i%PAL.length],e:''},s));
}
const profile=()=>st.get('profile',{});
const eduOf=()=>profile().edu||null;
const eduLabel=e=>{e=e||eduOf();if(!e||!e.stage)return '';return EDU[e.stage].gn(+e.grade)+(e.track&&TRACKS[e.stage]?' · '+TRACKS[e.stage][e.track]:'')};
const eduNeedsTrack=(s,g)=>(s==='sec'&&g>=2)||(s==='bac'&&g>=2);
/* المواد الفعلية للطالب = مواد المرحلة (ما عدا ما أخفاه) + ما أضافه بنفسه */
function mySubs(){
  const e=eduOf(),off=(e&&e.off)||[];
  return eduSubjects(e).filter(s=>!off.includes(s.k));
}
/* خطة أسبوعية تلقائية: تدوير المواد على أيام الأسبوع بأربع مواد يومياً */
function genPlan(w){
  const L=mySubs().map(s=>s.k);if(!L.length)return ['rev'];
  const n=Math.min(4,L.length),start=((w+1)*3)%L.length,o=[];
  for(let i=0;i<n;i++)o.push(L[(start+i)%L.length]);
  if(w===5)o[n-1]='rev';
  return o;
}
/* الكتب: كتاب الوزارة لكل مادة */
const bookTitle=s=>'كتاب '+s.n+' – '+eduLabel();
const bookSearch=s=>'https://www.google.com/search?q='+encodeURIComponent('كتاب الوزارة '+s.n+' '+eduLabel()+' pdf موقع وزارة التربية والتعليم المصرية');
