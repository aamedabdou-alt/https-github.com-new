const setT=(q,v)=>{const e=$(q);if(e)e.textContent=v};
/* ========== مؤقّت التركيز بملء الشاشة (يعتمد على محرّك الصوت أعلاه) ========== */
const FT={end:0,rem:0,total:0,run:false,tiv:null,qiv:null,qto:null,wl:null,o:null,lastR:-1,logged:true,started:false,readPending:null};
const fmtT=s=>pad(Math.floor(s/60))+':'+pad(s%60);
function focusOpen(o){
  FT.o=o;FT.logged=true;FT.started=false;FT.total=0;FT.rem=0;
  const fo=st.get('fopts',{});
  $('#fmin').value=o.m||fo.m||50;$('#snd').value=fo.snd||'amb';$('#vol').value=fo.vol==null?60:fo.vol;$('#qi').value=fo.qi||'5';$('#tk').checked=fo.tk!==false;$('#tv').value=fo.tv==null?50:fo.tv;
  setT('#fsTitle',o.label||'جلسة تركيز');
  $('#fsSetup').hidden=false;$('#fsRun').hidden=true;$('#fs').hidden=false;
}
function focusBegin(){
  const m=clamp(parseInt($('#fmin').value,10)||50,1,240);
  st.set('fopts',{m:m,snd:$('#snd').value,vol:+$('#vol').value,qi:$('#qi').value,tk:$('#tk').checked,tv:+$('#tv').value});
  FT.total=m*60;FT.rem=FT.total;FT.lastR=-1;FT.logged=false;FT.started=true;
  setT('#big',fmtT(FT.rem));setT('#fsl',FT.o.label||'');setT('#fm','الصوت: يعمل');
  $('#fsSetup').hidden=true;$('#fsRun').hidden=false;
  try{const el=$('#fs');if(el.requestFullscreen)el.requestFullscreen().catch(()=>{})}catch(e){}
  try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(l=>{FT.wl=l}).catch(()=>{})}catch(e){}
  ctx();focusResume();playS();showQ();clearInterval(FT.qiv);const iv=+$('#qi').value;if(iv)FT.qiv=setInterval(showQ,iv*60000);
}
function showQ(msg){
  const b=$('#fq');b.innerHTML=msg||qh(rq());clearTimeout(FT.qto);
  if(A)G.fromTo(b,{opacity:0,y:16},{opacity:1,y:0,duration:2});else b.style.opacity=1;
  if(!msg)FT.qto=setTimeout(()=>{if(A)G.to(b,{opacity:0,duration:2});else b.style.opacity=0},60000);
}
function floop(){
  if(!FT.run)return;const r=Math.max(0,Math.ceil((FT.end-Date.now())/1000));
  if(r!==FT.lastR){FT.lastR=r;setT('#big',fmtT(r));document.title=fmtT(r)+' — تركيز';if(r>0)tickS()}
  if(r<=0)ffin();
}
function focusResume(){FT.end=Date.now()+FT.rem*1000;FT.run=true;clearInterval(FT.tiv);FT.tiv=setInterval(floop,250);setT('#fp','إيقاف مؤقت')}
function focusPause(){FT.rem=Math.max(0,Math.ceil((FT.end-Date.now())/1000));FT.run=false;clearInterval(FT.tiv);setT('#fp','متابعة')}
function ffin(){
  FT.run=false;FT.rem=0;clearInterval(FT.tiv);clearInterval(FT.qiv);stopS();ping();setT('#big','00:00');flog();
  showQ('<div class="qt">أحسنت، أتممت الجلسة. خذ استراحة قصيرة وكوب ماء.</div>');
}
function markBlock(k,i){const a=st.get('sdone',{});a[k]=a[k]||{};a[k][i]=1;st.set('sdone',a)}
function flog(){
  if(FT.logged||!FT.started||!FT.o)return;FT.logged=true;
  const left=FT.run?Math.max(0,Math.ceil((FT.end-Date.now())/1000)):FT.rem,sec=FT.total-left,mins=Math.round(sec/60);
  if(mins<1)return;
  const o=FT.o,k=td();
  if(o.kind==='read'){
    const a=st.get('rlog',{});a[k]=a[k]||[];const e={id:uid(),book:o.book||'',min:mins,pages:0,at:Date.now()};a[k].push(e);st.set('rlog',a);FT.readPending=e.id;
  }else{
    D.addSmin(k,o.subj||'rev',mins);
    if(o.bi!=null&&sec>=FT.total*.8)markBlock(k,o.bi);
    const d=st.get('done',{});d[k]=(d[k]||0)+1;st.set('done',d);
  }
  toast('سُجّلت '+mins+' دقيقة');
}
function focusClose(){
  if(FT.run)FT.rem=Math.max(0,Math.ceil((FT.end-Date.now())/1000));
  FT.run=false;flog();clearInterval(FT.tiv);clearInterval(FT.qiv);clearTimeout(FT.qto);stopS();
  $('#fs').hidden=true;$('#fq').style.opacity=0;document.title=APP_NAME;
  try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}
  try{if(FT.wl){FT.wl.release();FT.wl=null}}catch(e){}
  const p=FT.readPending;FT.readPending=null;FT.started=false;
  if(p)askPages(p);
  renderSec(curSec);
}
ACT.fgo=focusBegin;
ACT.fcancel=focusClose;
ACT.fp=()=>{FT.run?focusPause():focusResume()};
ACT.fm=()=>{if(on){stopS();setT('#fm','الصوت: متوقف')}else{playS();setT('#fm','الصوت: يعمل')}};
ACT.fx=focusClose;
$('#vol')&&($('#vol').oninput=()=>{const v=$('#vol').value/100;aud.volume=v;if(mg)mg.gain.setTargetAtTime(v,ac.currentTime,.1)});
$('#aud')&&($('#aud').onchange=e=>{const f=e.target.files[0];if(f){if(fileUrl)URL.revokeObjectURL(fileUrl);fileUrl=URL.createObjectURL(f);$('#snd').value='file';setT('#audN',f.name)}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#fs').hidden)focusClose()});
/* بدء جلسة من أي مكان */
function startFocus(o){o=o||{};o.kind=o.kind||'study';o.subj=o.subj||'rev';o.label=o.label||('تركيز: '+sub(o.subj).n);focusOpen(o)}
