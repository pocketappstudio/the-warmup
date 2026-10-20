// Copies the web app into www/ for Capacitor. Pages keeps serving the repo root unchanged.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),out=path.join(root,'www');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const f of ['index.html','manifest.json','icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png','privacy.html','terms.html','support.html'])fs.copyFileSync(path.join(root,f),path.join(out,f));
for(const d of ['css','js','audio'])fs.cpSync(path.join(root,d),path.join(out,d),{recursive:true});
if(process.env.APP_BUILD){const f=path.join(out,'index.html');fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('<head>','<head><script>window.BUILD='+JSON.stringify(process.env.APP_BUILD)+'</script>'))}
// DEMO=1 only for CI simulator screenshots: seeds fictional data and walks Today > Current Need. Never set for store builds.
if(process.env.DEMO==='1'){const f=path.join(out,'index.html');const demo=`<script>(function(){const K='thewarmup.v1';if(!localStorage.getItem(K)){const a={};for(let k=0;k<4;k++)for(let i=1;i<7;i++)for(const d of 'NEOAC')a[d+i+'_'+k]=2+((i*7+k*3+d.charCodeAt(0))%4);localStorage.setItem(K,JSON.stringify({answers:a,weak:[],her:{name:''},started:true,log:{},license:{iap:true}}));location.replace('index.html#today');setTimeout(()=>location.reload(),50);return}
setTimeout(()=>{const o=document.getElementById('needopen');o&&o.click();setTimeout(()=>{const w=document.querySelector('[data-nw]');w&&w.click();const n=document.getElementById('neednote');if(n){n.value='I got fired';n.dispatchEvent(new Event('input'))}const c=document.querySelector('.need');c&&window.scrollTo(0,c.getBoundingClientRect().top+scrollY-120)},400)},12000);
setTimeout(()=>{const b=document.getElementById('needsave');b&&b.click();setTimeout(()=>{const c=document.querySelector('.need');c&&window.scrollTo(0,c.getBoundingClientRect().top+scrollY-120)},400)},24000)})()</script>`;fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('</body>',demo+'</body>'))}
console.log('www ready');
