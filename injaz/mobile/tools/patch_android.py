"""يُشغَّل بعد cap add android: يضيف الأذونات وصوت المنبّه والأيقونات."""
import re,sys,math,struct,wave,shutil,os
root=sys.argv[1]            # مجلد android
src=sys.argv[2]             # مجلد src فيه الأيقونات
man=os.path.join(root,'app/src/main/AndroidManifest.xml')
s=open(man,encoding='utf8').read()
perms=['android.permission.POST_NOTIFICATIONS','android.permission.SCHEDULE_EXACT_ALARM','android.permission.USE_EXACT_ALARM','android.permission.VIBRATE','android.permission.WAKE_LOCK','android.permission.RECEIVE_BOOT_COMPLETED','android.permission.CAMERA']
add=''.join('    <uses-permission android:name="%s" />\n'%p for p in perms if p not in s)
s=s.replace('</manifest>',add+'    <uses-feature android:name="android.hardware.camera" android:required="false" />\n</manifest>')
s=s.replace('<activity','<activity android:showWhenLocked="true" android:turnScreenOn="true"',1) if 'showWhenLocked' not in s else s
open(man,'w',encoding='utf8').write(s)
# صوت المنبّه
raw=os.path.join(root,'app/src/main/res/raw');os.makedirs(raw,exist_ok=True)
w=wave.open(os.path.join(raw,'alarm.wav'),'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(22050)
fr=[]
for rep in range(6):
    for f,d in ((880,.18),(1175,.18),(880,.18),(1175,.18),(0,.3)):
        for i in range(int(22050*d)):
            v=0 if f==0 else int(16000*math.sin(2*math.pi*f*i/22050)*min(1,i/300,(int(22050*d)-i)/300))
            fr.append(struct.pack('<h',v))
w.writeframes(b''.join(fr));w.close()
# الأيقونات
from PIL import Image
base=Image.open(os.path.join(src,'icon-512.png')).convert('RGBA')
for d,sz in {'mdpi':48,'hdpi':72,'xhdpi':96,'xxhdpi':144,'xxxhdpi':192}.items():
    p=os.path.join(root,'app/src/main/res/mipmap-'+d);os.makedirs(p,exist_ok=True)
    for n in ('ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png'):
        base.resize((sz,sz),Image.LANCZOS).save(os.path.join(p,n))
    dr=os.path.join(root,'app/src/main/res/drawable-'+d);os.makedirs(dr,exist_ok=True)
    base.resize((sz//2,sz//2)).save(os.path.join(dr,'ic_stat_icon.png'))
for f in os.listdir(os.path.join(root,'app/src/main/res')):
    if f.startswith('mipmap-anydpi'): shutil.rmtree(os.path.join(root,'app/src/main/res',f))
print('patched')
