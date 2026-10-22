/* ========== منبّهات النظام (Android عبر Capacitor) ==========
   تُجدول إشعارات دقيقة يشغّلها نظام أندرويد نفسه، فتعمل والتطبيق مغلق والشاشة مقفلة.
   في المتصفح العادي لا يفعل هذا الملف شيئاً. */
const NAT={ok:false,sig:'',LN:null};
function natInit(){
  const C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
  NAT.LN=C.Plugins&&C.Plugins.LocalNotifications;if(!NAT.LN)return;NAT.ok=true;
  (async()=>{
    try{
      const p=await NAT.LN.checkPermissions();
      if(p.display!=='granted')await NAT.LN.requestPermissions();
      await NAT.LN.createChannel({id:'alarm',name:'المنبّهات',description:'منبّه الصباح وتنبيهات المهام',importance:5,visibility:1,vibration:true,sound:'alarm.wav',lights:true});
      NAT.LN.addListener('localNotificationActionPerformed',e=>{
        const x=(e.notification&&e.notification.extra)||{};
        setTimeout(()=>{try{if(x.t==='morning'&&!alarmDone(x.d))startRing(x.d,false);else if(x.t==='task'){const t=TASKS().find(y=>y.id===x.id);if(t&&!t.done)showTaskAlarm(t)}}catch(_){}},400);
      });
      natSync(true);setInterval(()=>natSync(false),30000);
      document.addEventListener('visibilitychange',()=>{if(!document.hidden)natSync(true)});
    }catch(e){}
  })();
}
const natId=s=>{let h=7;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return 2000+Math.abs(h)%2000000000};
async function natSync(force){
  if(!NAT.ok)return;
  const items=[],now=Date.now(),a=cfg.alarm;
  if(a.on){
    for(let i=0;i<8;i++){
      const d=addDays(td(),i),w=wdOf(d);if(!a.days.includes(w)||a.skip===d||alarmDone(d))continue;
      const m=alarmMin(d),at=new Date(d+'T00:00:00');at.setMinutes(m);
      if(at.getTime()<=now)continue;
      items.push({id:100+i,title:'منبّه الصباح',body:'استيقظ الآن. افتح التطبيق لإيقافه.',schedule:{at:at,allowWhileIdle:true},channelId:'alarm',sound:'alarm.wav',extra:{t:'morning',d:d},ongoing:false,autoCancel:true});
    }
  }
  const snz=SNZ();
  TASKS().forEach(t=>{
    if(t.done||t.al==null||t.al<0||!t.tm||!t.due)return;
    let at=taskDue(t)-t.al*60000;if(snz[t.id])at=Math.max(at,snz[t.id]);
    if(at<=now||at>now+14*864e5)return;
    items.push({id:natId(String(t.id)),title:'مهمة: '+(t.t||''),body:'حان موعدها '+t.tm,schedule:{at:new Date(at),allowWhileIdle:true},channelId:'alarm',sound:'alarm.wav',extra:{t:'task',id:t.id}});
  });
  const sig=JSON.stringify(items.map(x=>[x.id,+x.schedule.at]));
  if(!force&&sig===NAT.sig)return;NAT.sig=sig;
  try{
    const pend=await NAT.LN.getPending();
    if(pend.notifications&&pend.notifications.length)await NAT.LN.cancel({notifications:pend.notifications.map(n=>({id:n.id}))});
    if(items.length)await NAT.LN.schedule({notifications:items});
  }catch(e){}
}
