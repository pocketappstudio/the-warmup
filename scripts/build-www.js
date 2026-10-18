// Copies the web app into www/ for Capacitor. Pages keeps serving the repo root unchanged.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),out=path.join(root,'www');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const f of ['index.html','manifest.json','icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png','privacy.html','terms.html','support.html'])fs.copyFileSync(path.join(root,f),path.join(out,f));
for(const d of ['css','js','audio'])fs.cpSync(path.join(root,d),path.join(out,d),{recursive:true});
console.log('www ready');
