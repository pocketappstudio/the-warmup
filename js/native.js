// Native (Capacitor iOS) bridge. Does nothing on the web.
(function(){
const C=window.Capacitor,isNative=!!(C&&C.isNativePlatform&&C.isNativePlatform());
window.NATIVE=isNative;if(!isNative){window.Native={is:false,haptic(){},share(){},widget(){},iap:null};return}
document.documentElement.classList.add('native');
const P=C.Plugins||{};
const PID='com.pocketappstudio.thewarmup.full';
const N=window.Native={is:true,
 haptic(k){try{const H=P.Haptics;if(!H)return;if(k==='success')H.notification({type:'SUCCESS'});else if(k==='medium')H.impact({style:'MEDIUM'});else H.impact({style:'LIGHT'})}catch(e){}},
 widget(d){try{const W=C.registerPlugin?C.registerPlugin('WidgetBridge'):P.WidgetBridge;W&&W.set(d)}catch(e){}},
 share(text){try{P.Share&&P.Share.share({text})}catch(e){}},
 async reminders(on,time){const L=P.LocalNotifications;if(!L)return false;
  try{await L.cancel({notifications:Array.from({length:40},(_,i)=>({id:1000+i}))})}catch(e){}
  if(!on)return true;
  let perm=await L.checkPermissions();if(perm.display!=='granted')perm=await L.requestPermissions();if(perm.display!=='granted')return false;
  const [hh,mm]=(time||'07:00').split(':').map(Number),refs=Object.keys(VERSES),now=new Date(),list=[];
  for(let i=0;i<30;i++){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i,hh,mm,0);if(d<=now)continue;
   const day=Math.floor(d.getTime()/864e5),ref=refs[day%refs.length];
   list.push({id:1000+i,title:'The WarmUp',body:VERSES[ref]+' - '+ref+' WEB',schedule:{at:d,allowWhileIdle:true}})}
  if(list.length)await L.schedule({notifications:list});return true}};
// In-app purchase (StoreKit via cordova-plugin-purchase)
const iap=N.iap={price:'',owned:false,ready:false,on:null,
 init(){document.addEventListener('deviceready',()=>{try{const{store,ProductType,Platform}=CdvPurchase;
   store.register([{id:PID,type:ProductType.NON_CONSUMABLE,platform:Platform.APPLE_APPSTORE}]);
   const chk=()=>{const o=store.owned(PID);const p=store.get(PID,Platform.APPLE_APPSTORE);if(p&&p.pricing)iap.price=p.pricing.price||'';iap.ready=!!p;if(o&&!iap.owned){iap.owned=true}iap.on&&iap.on()};
   store.when().productUpdated(chk).approved(t=>t.finish()).finished(chk);
   store.initialize([Platform.APPLE_APPSTORE]).then(chk)}catch(e){}},false)},
 buy(){try{const{store,Platform}=CdvPurchase;const p=store.get(PID,Platform.APPLE_APPSTORE);const o=p&&p.getOffer();if(o)return store.order(o)}catch(e){}},
 restore(){try{return CdvPurchase.store.restorePurchases()}catch(e){}}};
iap.init();
})();
