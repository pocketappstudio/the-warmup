// Native (Capacitor iOS) bridge. Does nothing on the web.
(function(){
const C=window.Capacitor,isNative=!!(C&&C.isNativePlatform&&C.isNativePlatform());
window.NATIVE=isNative;if(!isNative){window.Native={is:false,haptic(){},share(){},widget(){},iap:null};return}
document.documentElement.classList.add('native');
const P=C.Plugins||{};
// Native extras never block the app: sync throws and async rejections are swallowed.
const safe=f=>{try{const r=f();if(r&&r.catch)r.catch(()=>{});return r}catch(e){}};
const AND=C.getPlatform&&C.getPlatform()==='android';
const PID=AND?'thewarmup_full':'com.pocketappstudio.thewarmup.full';
const N=window.Native={is:true,store:AND?'Google Play':'Apple',
 haptic(k){const H=P.Haptics;if(!H)return;safe(()=>k==='success'?H.notification({type:'SUCCESS'}):H.impact({style:k==='medium'?'MEDIUM':'LIGHT'}))},
 widget(d){if(C.getPlatform&&C.getPlatform()!=='ios')return;safe(()=>{const W=C.registerPlugin?C.registerPlugin('WidgetBridge'):P.WidgetBridge;return W&&W.set(d)})},
 share(text){P.Share&&safe(()=>P.Share.share({text}))},
 async reminders(on,time){try{const L=P.LocalNotifications;if(!L)return false;
  try{await L.cancel({notifications:Array.from({length:40},(_,i)=>({id:1000+i}))})}catch(e){}
  if(!on)return true;
  let perm=await L.checkPermissions();if(perm.display!=='granted')perm=await L.requestPermissions();if(perm.display!=='granted')return false;
  const [hh,mm]=(time||'07:00').split(':').map(Number),refs=Object.keys(VERSES),now=new Date(),list=[];
  for(let i=0;i<30;i++){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i,hh,mm,0);if(d<=now)continue;
   const day=Math.floor(d.getTime()/864e5),ref=refs[day%refs.length];
   list.push({id:1000+i,title:'The WarmUp',body:VERSES[ref]+' - '+ref+' WEB',schedule:{at:d,allowWhileIdle:true}})}
  if(list.length)await L.schedule({notifications:list});return true}catch(e){return false}}};
// In-app purchase (StoreKit on iOS, Play Billing on Android, via cordova-plugin-purchase)
const iap=N.iap={price:'',owned:false,ready:false,on:null,
 init(){document.addEventListener('deviceready',()=>{try{const{store,ProductType,Platform}=CdvPurchase;const PLAT=AND?Platform.GOOGLE_PLAY:Platform.APPLE_APPSTORE;
   store.register([{id:PID,type:ProductType.NON_CONSUMABLE,platform:PLAT}]);
   const chk=()=>{const o=store.owned(PID);const p=store.get(PID,PLAT);if(p&&p.pricing)iap.price=p.pricing.price||'';iap.ready=!!p;if(o&&!iap.owned){iap.owned=true}iap.on&&iap.on()};
   store.when().productUpdated(chk).approved(t=>t.finish()).finished(chk);
   store.initialize([PLAT]).then(chk)}catch(e){}},false)},
 buy(){try{const{store,Platform}=CdvPurchase;const PLAT=AND?Platform.GOOGLE_PLAY:Platform.APPLE_APPSTORE;const p=store.get(PID,PLAT);const o=p&&p.getOffer();if(o)return safe(()=>store.order(o))}catch(e){}},
 restore(){return safe(()=>CdvPurchase.store.restorePurchases())}};
iap.init();
})();
