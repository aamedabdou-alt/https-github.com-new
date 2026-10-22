let ac,mg,nb,bus,live=[],clearFn=null,on=false,fileUrl=null,tkAlt=false;const aud=new Audio();aud.loop=true;
const rnd=(a,b)=>a+Math.random()*(b-a),reg=n=>(live.push(n),n);
function ctx(){if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();mg=ac.createGain();mg.gain.value=.6;mg.connect(ac.destination);
nb=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate);const d=nb.getChannelData(0),n=d.length;for(let i=0;i<n;i++)d[i]=Math.random()*2-1;for(let i=0;i<4000;i++){d[i]*=i/4000;d[n-1-i]*=i/4000}}
if(ac.resume)ac.resume();return ac}
const noise=(f,type,q,g)=>{const s=reg(ac.createBufferSource());s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const gn=ac.createGain();gn.gain.value=g;s.connect(fl);fl.connect(gn);gn.connect(bus);s.start();return{fl,gn}};
const lfo=(rate,depth,param)=>{const o=reg(ac.createOscillator()),g=ac.createGain();o.frequency.value=rate;g.gain.value=depth;o.connect(g);g.connect(param);o.start()};
const sched=(fn,a,b)=>{let t;const go=()=>{fn();t=setTimeout(go,rnd(a,b))};go();return()=>clearTimeout(t)};
const echo=(t,fb)=>{const d=ac.createDelay(1),g=ac.createGain();d.delayTime.value=t;g.gain.value=fb;d.connect(g);g.connect(d);d.connect(bus);return d};
const MODES={
amb(){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=900;f.connect(bus);f.connect(echo(.45,.45));
const CH=[[110,164.8,220,261.6],[87.3,130.8,174.6,220],[130.8,196,261.6,329.6],[98,146.8,196,246.9]];let k=0;
const os=[0,1,2,3].map(i=>{const o=reg(ac.createOscillator()),g=ac.createGain();o.type=i%2?'sine':'triangle';g.gain.value=.12;o.connect(g);g.connect(f);o.start();return o});
const ch=()=>{os.forEach((o,i)=>o.frequency.setTargetAtTime(CH[k][i],ac.currentTime,1.5));k=(k+1)%4};ch();const iv=setInterval(ch,9000);return()=>clearInterval(iv)},
dew(){const e=echo(.38,.4);noise(250,'lowpass',1,.04);
return sched(()=>{const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=rnd(700,1700);o.frequency.setValueAtTime(f*.6,t);o.frequency.exponentialRampToValueAtTime(f,t+.06);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(rnd(.15,.35),t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.35);o.connect(g);g.connect(bus);g.connect(e);o.start(t);o.stop(t+.4)},300,1500)},
forest(){const w=noise(450,'lowpass',.7,.5);lfo(.12,.3,w.gn.gain);lfo(.07,200,w.fl.frequency);noise(4500,'highpass',.5,.02);
return sched(()=>{const p=ac.createStereoPanner?ac.createStereoPanner():null,b=rnd(2200,3800),n=Math.floor(rnd(2,5));if(p){p.pan.value=rnd(-.8,.8);p.connect(bus)}
for(let j=0;j<n;j++){const t=ac.currentTime+j*.11,o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(b,t);o.frequency.exponentialRampToValueAtTime(b*rnd(1.15,1.5),t+.08);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.07,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.1);o.connect(g);g.connect(p||bus);o.start(t);o.stop(t+.12)}},1800,6000)},
water(){const a=noise(900,'bandpass',.6,.5),b=noise(2400,'bandpass',1.2,.12);lfo(.35,.15,a.gn.gain);lfo(.9,.05,b.gn.gain);lfo(.2,300,a.fl.frequency);return null},
night(){noise(300,'lowpass',.7,.12);const cr=reg(ac.createOscillator()),cg=ac.createGain();cr.frequency.value=4300;cg.gain.value=0;cr.connect(cg);cg.connect(bus);cr.start();
return sched(()=>{const t=ac.currentTime;for(let j=0;j<4;j++){cg.gain.setTargetAtTime(.025,t+j*.12,.005);cg.gain.setTargetAtTime(0,t+j*.12+.06,.005)}},900,1600)}};
function stopS(){on=false;aud.pause();if(!ac||!bus)return;const b=bus,old=live,c=clearFn;bus=null;live=[];clearFn=null;if(c)c();b.gain.setTargetAtTime(0,ac.currentTime,.3);setTimeout(()=>{old.forEach(n=>{try{n.stop()}catch(e){}});b.disconnect()},1500)}
function playS(){const m=$('#snd').value;stopS();const v=$('#vol').value/100;
if(m=='file'&&fileUrl){on=true;aud.src=fileUrl;aud.volume=v;aud.play().catch(()=>{})}
else if(MODES[m]){on=true;ctx();mg.gain.setTargetAtTime(v,ac.currentTime,.1);bus=ac.createGain();bus.gain.value=0;bus.connect(mg);bus.gain.setTargetAtTime(1,ac.currentTime,1.5);clearFn=MODES[m]()}}
$('#vol').oninput=()=>{const v=$('#vol').value/100;aud.volume=v;if(mg)mg.gain.setTargetAtTime(v,ac.currentTime,.1)};
$('#aud').onchange=e=>{const f=e.target.files[0];if(f){if(fileUrl)URL.revokeObjectURL(fileUrl);fileUrl=URL.createObjectURL(f);$('#snd').value='file';$('#audN').textContent=f.name}};
function tickS(){if(!$('#tk').checked||!ac)return;const t=ac.currentTime,s=ac.createBufferSource();s.buffer=nb;const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=(tkAlt=!tkAlt)?2200:1500;f.Q.value=4;const g=ac.createGain();g.gain.setValueAtTime($('#tv').value/100*1.4,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);s.connect(f);f.connect(g);g.connect(ac.destination);s.start(t,Math.random()*2,.06)}
function ping(){try{const a=ctx(),o=a.createOscillator(),g=a.createGain();o.frequency.value=660;g.gain.setValueAtTime(.2,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+1.5);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+1.5)}catch(e){}}
