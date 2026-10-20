(function(){
const KEY='thewarmup.v1';try{if(!localStorage.getItem(KEY)){for(const o of ['lovelessons.v1','lovework.v1','loveher.v1','hfh.v1']){const v=localStorage.getItem(o);if(v){localStorage.setItem(KEY,v);break}}}['lovelessons.v1','lovework.v1','loveher.v1','hfh.v1'].forEach(o=>localStorage.removeItem(o))}catch(e){}
const S=Object.assign({answers:{},weak:[],weakOther:'',her:{},log:{},license:null,started:false},JSON.parse(localStorage.getItem(KEY)||'{}'));
if(!Array.isArray(S.her.pressures))S.her.pressures=[];S.her.pressures=S.her.pressures.filter(p=>p&&PRESSURE.some(x=>x[0]===p.k));
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const $=s=>document.querySelector(s), app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const herName=()=>S.her.name||'your wife';
// Item order: round-robin like the published inventory (N1,E1,O1,A1,C1,N2,...)
const ITEMS=[];for(let k=0;k<4;k++)for(let f=1;f<=6;f++)for(const d of 'NEOAC'){const fc=IPIP.find(x=>x.code===d+f);ITEMS.push({id:fc.code+'_'+k,facet:fc.code,text:fc.items[k][0],key:fc.items[k][1]})}
const PER=10;
function scores(){const fac={};for(const it of ITEMS){const a=S.answers[it.id];if(!a)return null;const v=it.key>0?a:6-a;fac[it.facet]=(fac[it.facet]||0)+v}
 const pct={};for(const c in fac)pct[c]=Math.round((fac[c]-4)/16*100);const dom={};for(const d of 'NEOAC'){let s=0;for(let f=1;f<=6;f++)s+=fac[d+f];dom[d]=Math.round((s-24)/96*100)}return{fac,pct,dom}}
const level=p=>p<35?'low':p>65?'high':'mid';
function suggested(sc){if(!sc)return[];return WEAK.filter(w=>w.auto&&level(sc.pct[w.auto[0]])===w.auto[1]).map(w=>w.id)}
const DISCLAIMER='<p class="small"><b>Not a clinical diagnosis.</b> This is a self-reflection tool based on the public-domain IPIP-NEO-120 (Johnson, 2014; International Personality Item Pool, ipip.ori.org). Scores are relative to the scale, not to population norms. For mental health concerns, talk to a qualified counselor or pastor.</p>';
const SAFE='If you or anyone in your home is in danger, or you have thoughts of self-harm, call 911 now, or 988 for crisis support.';
const NOTADV='Not medical, mental-health, legal, financial or marriage-counseling advice. Seek pastoral or qualified help.';
function verse(ref){return `<blockquote>${esc(VERSES[ref])}<b>${esc(ref)} WEB</b></blockquote>`}

// ---------- Assignment engine ----------
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
function pick(date){
 const sc=scores();const weak=new Set(S.weak.length?S.weak:suggested(sc));const love=new Set(S.her.love||[]),stress=new Set(S.her.stress||[]);const season=S.her.season;
 const recent=new Set(Object.entries(S.log).filter(([d])=>d<date).sort().slice(-30).map(([,v])=>v.aid));
 const press=activePressures();
 let best=null,bs=-1e9;for(const a of ASSIGN_SRC){let s=0;for(const t of a.tags){if(weak.has(t))s+=3;if(love.has(t))s+=2;if(stress.has(t))s+=2;if(t===season)s+=3}
  for(const p of press){if(a.tags.includes('p-'+p.k))s+=p.wt;else if(a.tags.includes(p.alias))s+=p.wt/2}
  if(recent.has(a.id))s-=50;s+=(hash(date+a.id)%100)/40;if(s>bs){bs=s;best=a}}return best}
const WEEK=7*864e5;
function activePressures(){return (S.her.pressures||[]).map(p=>{const d=PRESSURE.find(x=>x[0]===p.k),fresh=p.w!=='week'||Date.now()-(p.at||0)<WEEK;return{k:p.k,alias:d[3],wt:(p.w==='week'?(fresh?5:2):3)+(p.s==='major'?1:0)}})}
function dayPressure(a){const ps=S.her.pressures||[];const p=ps.filter(p=>a.tags.includes('p-'+p.k)).sort((x,y)=>(y.w==='week')-(x.w==='week'))[0];return p&&PRESSURE.find(x=>x[0]===p.k)}
const prKeys=()=>S.noKids?['me','wife','home']:['me','wife','kids','home'];
const prAll=r=>{const p=(r&&r.pr)||{};return prKeys().every(k=>p[k])&&!!p.aloud};
function prStreak(){let n=0;const d=new Date();if(!prAll(S.log[today()]))d.setDate(d.getDate()-1);for(;;){if(prAll(S.log[fmt(d)])){n++;d.setDate(d.getDate()-1)}else break}return n}
function dayVerse(a){const pd=dayPressure(a);if(pd)return{ref:pd[4],pd};const w=WEAK.find(w=>S.weak.includes(w.id)&&a.tags.includes(w.id));return w?{ref:w.v[0],w}:{ref:'Eph 5:25'}}
function prayCards(a,r){const v=dayVerse(a),P=makePrayers(a,{seed:today()+a.id,name:S.her.name,weak:v.w&&v.w.name,pressure:v.pd,verseRef:v.ref,need:r.need}),p=r.pr||{};
 const blk=(k,title,extra)=>`<div class="pray ${p[k]?'ok':''}"><div class="ph"><b>${title}</b>${extra||''}</div><p>${esc(P[k])}</p><button class="chk2 ${p[k]?'on':''}" data-pr="${k}">${p[k]?'Prayed ✓':'Mark prayed'}</button></div>`;
 return `<div class="card"><h2 style="margin-top:0">My prayer</h2><div class="ph"><p class="small vref">${esc(v.ref)} WEB</p>${window.NATIVE?'<span><button class="lnk" data-share="verse">Share verse</button> <button class="lnk" data-share="me">Share prayer</button></span>':''}</div>${blk('me','')}</div>
 <div class="card"><h2 style="margin-top:0">Leadership Challenge</h2><p class="small vref">Pray each one. Pray aloud with your family.</p>
 ${blk('wife','Pray for your wife')}${S.noKids?'':blk('kids','Pray for your children','<button class="lnk" id="nokids">No children at home</button>')}${blk('home','Pray for your home')}
 <button class="chk2 aloud ${p.aloud?'on':''}" data-pr="aloud">${p.aloud?'Prayed aloud with family ✓':'Prayed aloud with family'}</button>
 <div class="pstreak"><b>${prStreak()}</b> day prayer streak${S.noKids?' <button class="lnk" id="yeskids">Children at home</button>':''}</div></div>`}
let needOpen=false,needDraft={k:'',who:'self'};
function needCard(r){const n=r.need;if(n){const d=NEED.find(x=>x[0]===n.k),w=NEEDWHO.find(x=>x[0]===n.who);
  return `<div class="card need"><div class="ph"><b>Current Need</b><button class="lnk" id="needundo">Undo</button></div><div><span class="tag">${esc(d[1])}</span><span class="tag">${esc(w[1])}</span></div>${n.note?`<p class="muted">${esc(n.note)}</p>`:''}<p>${esc(d[4])}</p>${verse(d[3])}<p class="small">${SAFE}</p><p class="small">${NOTADV}</p></div>`}
 if(!needOpen)return `<button class="btn alt full" id="needopen">+ Current Need</button>`;
 return `<div class="card need"><b>Current Need</b><div class="chips">${NEED.map(d=>`<button type="button" class="chip ${needDraft.k===d[0]?'on':''}" data-nk="${d[0]}">${esc(d[1])}</button>`).join('')}</div>
 <b class="small" style="display:block;margin-top:10px">Who it affects</b><div class="chips">${NEEDWHO.map(d=>`<button type="button" class="chip ${needDraft.who===d[0]?'on':''}" data-nw="${d[0]}">${esc(d[1])}</button>`).join('')}</div>
 <input type="text" id="neednote" maxlength="80" placeholder="Short note (optional)" style="margin-top:12px"><button class="btn full" id="needsave" aria-disabled="${needDraft.k?'false':'true'}">Save</button> <button class="lnk" id="needcancel">Cancel</button><p class="small">${SAFE}</p><p class="small">${NOTADV}</p></div>`}
function dayRec(date){if(!S.log[date]){S.log[date]={aid:pick(date).id,done:false};save()}return S.log[date]}
function streak(){let n=0;const d=new Date();if(!(S.log[today()]||{}).done)d.setDate(d.getDate()-1);for(;;){const k=d.toISOString?fmt(d):'';if(S.log[k]&&S.log[k].done){n++;d.setDate(d.getDate()-1)}else break}return n}
function fmt(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
const daysUsed=()=>Object.keys(S.log).length;
const locked=()=>!S.license&&!S.log[today()]&&daysUsed()>=CONFIG.freeDays;

// ---------- Views ----------
const V={};
V.welcome=()=>`<h1>Love her from the heart outward.</h1>
<p>The WarmUp helps a Christian husband who knows <i>what</i> he should do, but not always <i>how</i>. It learns your personality, helps you face your weaknesses honestly with Scripture, and gives you one concrete act of service for your wife every day.</p>
<div class="card"><b>How it works</b><ol><li>A 120-question research-based personality inventory (about 12 minutes)</li><li>A private heart audit: weaknesses + Scripture</li><li>"Know Her": what you know about your wife</li><li>A daily assignment: heart posture, act of service, evening reflection</li></ol></div>
<div class="card"><b>Private by design.</b> No account. Everything stays on this device. This isn't a secret app; it's a tool you could gladly show her.</div>
<a class="btn full" href="#test/0">Begin the inventory</a>${DISCLAIMER}`;
V.test=(p)=>{p=+p||0;const items=ITEMS.slice(p*PER,p*PER+PER),pages=ITEMS.length/PER;const n=Object.keys(S.answers).length;
 return `<h1>Personality inventory</h1><p class="small">Describe yourself as you generally are now, not as you wish to be. Page ${p+1} of ${pages}.</p><div class="prog"><i style="width:${n/1.2}%"></i></div>
 ${items.map(it=>`<div class="q"><p>${esc(it.text)}</p><div class="scale">${[1,2,3,4,5].map(v=>`<label><input type="radio" name="${it.id}" value="${v}" ${S.answers[it.id]==v?'checked':''}><span>${v}</span>${['Very<br>inaccurate','','Neutral','','Very<br>accurate'][v-1]}</label>`).join('')}</div></div>`).join('')}
 <p id="err" class="small" style="color:#a33"></p><div style="display:flex;gap:8px">${p>0?`<a class="btn alt" href="#test/${p-1}">Back</a>`:''}<button class="btn" style="flex:1" id="next">${p<pages-1?'Next':'See my results'}</button></div>`};
V.results=()=>{const sc=scores();if(!sc)return `<p>Finish the inventory first.</p><a class="btn" href="#test/0">Continue</a>`;
 return `<h1>Your personality profile</h1>${DISCLAIMER}${'NEOAC'.split('').map(d=>{const p=sc.dom[d],D=DOMAINS[d];return `<div class="card"><b>${D[0]}</b> <span class="muted">${d==='N'?100-p:p}/100</span><div class="bar"><i style="width:${d==='N'?100-p:p}%"></i></div><p>${level(p)==='mid'?'Near the middle. At times: '+esc(D[1].split('.')[0])+'. At other times: '+esc(D[2].split('.')[0])+'.':esc(level(p)==='low'?D[1]:D[2])}</p>
 <details><summary class="small">Facets</summary>${[1,2,3,4,5,6].map(f=>{const c=d+f,fp=sc.pct[c],fc=IPIP.find(x=>x.code===c);return `<div style="margin:8px 0"><span class="small">${fc.name}: <b>${level(fp)==='low'?FACET_DESC[c][0]:level(fp)==='high'?FACET_DESC[c][1]:'Balanced'}</b> (${fp})</span><div class="bar"><i style="width:${fp}%"></i></div></div>`}).join('')}</details></div>`}).join('')}
 <p class="small">Steadiness is the inverse of the "Neuroticism" domain: higher = calmer.</p><a class="btn full" href="#weak">Next: private heart audit</a><a class="btn alt full" href="#test/0">Retake / review answers</a>`};
V.weak=()=>{const sc=scores();const sug=suggested(sc);if(!S.weakInit&&sc){S.weak=[...new Set([...S.weak,...sug])];S.weakInit=true;save()}
 return `<h1>Private heart audit</h1><p>Only you see this. ${sc?'We pre-checked weaknesses suggested by your results; uncheck any that don\'t fit and add your own.':'Take the inventory to get suggestions, or choose your own.'}</p>
 ${WEAK.map(w=>`<div class="card ${S.weak.includes(w.id)?'':'muted'}"><label class="chk"><input type="checkbox" data-w="${w.id}" ${S.weak.includes(w.id)?'checked':''}><span><b>${esc(w.name)}</b>${sug.includes(w.id)?' <span class="tag">from your results</span>':''}</span></label>
 ${S.weak.includes(w.id)?`<p class="small"><b>How it erodes love for her:</b> ${esc(w.others)}<br><b>How it erodes you:</b> ${esc(w.self)}</p>${w.v.map(verse).join('')}`:''}</div>`).join('')}
 <h2>In your own words</h2><textarea id="weakOther" placeholder="Anything else you know you need to work on...">${esc(S.weakOther)}</textarea>
 <p>${verse('Ps 139:23-24')}</p><a class="btn full" href="#her">Next: Know Her</a>`};
const chkList=(name,list,sel)=>list.map(([k,l])=>`<label class="chk"><input type="checkbox" name="${name}" value="${k}" ${(sel||[]).includes(k)?'checked':''}>${esc(l)}</label>`).join('');
const pressRow=p=>{const d=PRESSURE.find(x=>x[0]===p.k);const seg=(g,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button type="button" data-g="${g}" data-v="${v}" class="${p[g]===v?'on':''}">${l}</button>`).join('')}</div>`;
 return `<div class="prow" data-k="${p.k}"><b>${esc(d[1])}</b><div class="segs">${seg('w',[['week','This week'],['ongoing','Ongoing']])}${seg('s',[['major','Major'],['minor','Minor']])}</div></div>`};
const pressBox=()=>{const sel=S.her.pressures||[];return `<b>Pressures</b><div class="chips">${PRESSURE.map(d=>`<button type="button" class="chip ${sel.some(p=>p.k===d[0])?'on':''}" data-p="${d[0]}">${esc(d[1])}</button>`).join('')}</div><div id="prows">${sel.map(pressRow).join('')}</div>`};
V.her=()=>{const h=S.her;return `<h1>Know Her</h1>
<form id="herf"><div class="card"><label>Her first name<input type="text" name="name" value="${esc(h.name)}"></label></div>
<div class="card"><label><b>Current season</b><select name="season">${SEASON.map(([k,l])=>`<option value="${k}" ${(h.season||'ordinary')===k?'selected':''}>${l}</option>`).join('')}</select></label></div>
<div class="card" id="pbox">${pressBox()}</div>
<div class="card"><b>She feels most loved through...</b>${chkList('love',LOVE,h.love)}</div>
<div class="card"><b>What stresses her right now</b>${chkList('stress',STRESS,h.stress)}</div>
<div class="card"><label><b>Her interests</b><textarea name="interests" placeholder="Gardening, a book series, a sports team, coffee shops...">${esc(h.interests)}</textarea></label>
<label><b>Her schedule / hardest time of day</b><textarea name="schedule" placeholder="e.g. Mornings with the kids; works Tue/Thu">${esc(h.schedule)}</textarea></label>
<label><b>What I noticed lately</b><textarea name="notes" placeholder="Things she mentioned, worries, hopes...">${esc(h.notes)}</textarea></label></div>
<button class="btn full">Save and see today's assignment</button></form>`};
V.today=()=>{if(!scores()&&!S.started)return V.welcome();if(locked())return V.unlock(true);const r=dayRec(today()),a=ASSIGN_SRC[r.aid],n=herName();
 const sub=s=>esc(s).replace(/\bher\b/,m=>m);const st=streak();
 return `<div class="streak card"><div><b>${st}</b><span class="small">day streak</span></div><div><b>${Object.values(S.log).filter(x=>x.done).length}</b><span class="small">completed</span></div><div><b>${S.license?'∞':Math.max(0,CONFIG.freeDays-daysUsed())}</b><span class="small">${S.license?'unlocked':'free days left'}</span></div></div>
 <div class="card ${r.done?'done':''}"><div class="posture">Heart posture · ${a.posture}</div><h1>${esc(a.title)}</h1><p class="muted">${esc(a.why)}</p>
 <h2>Today's act for ${esc(n)}</h2><p><b>${esc(a.act)}</b></p><ol class="steps">${a.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>
 ${S.her.interests||S.her.schedule?`<p class="small">Keep in mind: ${esc([S.her.interests,S.her.schedule].filter(Boolean).join(' · '))}</p>`:''}</div>
 ${needCard(r)}
 ${prayCards(a,r)}
 ${leadCards()}
 <div class="card"><h2 style="margin-top:0">Evening reflection</h2><p>${esc(a.reflect)}</p><textarea id="refl" placeholder="Write honestly. Only you will see this.">${esc(r.note)}</textarea>
 <button class="btn full ${r.done?'alt':'rust'}" id="done">${r.done?'Completed ✓ (tap to undo)':'Mark as done'}</button></div>
 ${(()=>{const pd=dayPressure(a);if(pd)return `<div class="card"><span class="tag">${esc(pd[1])}</span>${verse(pd[4])}</div>`;const w=WEAK.find(w=>S.weak.includes(w.id)&&a.tags.includes(w.id));return w?`<div class="card"><span class="tag">${esc(w.name)}</span>${verse(w.v[0])}</div>`:verse('Eph 5:25')})()}`};
function leadCards(){const ps=[...(S.her.pressures||[])].sort((x,y)=>(y.w==='week')-(x.w==='week')||(y.s==='major')-(x.s==='major'));if(!ps.length)return '';
 return `<div class="lead"><h2>Leading through it</h2><p class="small">Abuse or danger is not yours to handle alone: call 911 and seek pastoral or qualified help.</p>${ps.map((p,i)=>{const d=PRESSURE.find(x=>x[0]===p.k),g=GUIDE[p.k];return `<details class="card" ${i===0?'open':''}><summary><b>${esc(d[1])}</b><span class="tag">${p.w==='week'?'This week':'Ongoing'}</span></summary><ol class="steps">${g[0].map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${g[1].map(verse).join('')}</details>`}).join('')}</div>`}
V.history=()=>{const ds=Object.keys(S.log).sort().reverse();return `<h1>Completion log</h1><p>Streak: <b>${streak()}</b> · Completed: <b>${ds.filter(d=>S.log[d].done).length}</b> of ${ds.length} days</p>
 ${ds.map(d=>{const r=S.log[d],a=ASSIGN_SRC[r.aid];return `<div class="card ${r.done?'done':''}"><span class="small">${d} ${r.done?'✓ done':'· not done'}${prAll(r)?' · prayers ✓':''}${r.need?' · need: '+esc(NEED.find(x=>x[0]===r.need.k)[1].toLowerCase()):''}</span><br><b>${esc(a.title)}</b>${r.note?`<p class="small">${esc(r.note)}</p>`:''}</div>`}).join('')||'<p class="muted">No days yet.</p>'}`};
V.unlock=(wall)=>`<h1>${wall?'Your 7 free days are complete':'Unlock full access'}</h1><p>Well done finishing a week. Unlock unlimited daily assignments from the full library of ${ASSIGN_SRC.length}, with a one-time purchase, no subscription.</p>
 <div class="card">${window.NATIVE?`<button class="btn rust full" id="iapbuy">Full Access${Native.iap.price?' · '+esc(Native.iap.price):''}</button><button class="btn alt full" id="iaprestore">Restore Purchases</button><p id="lmsg" class="small"></p>`:CONFIG.gumroadProductId?`<a class="btn rust full" href="${esc(CONFIG.gumroadUrl)}" target="_blank" rel="noopener">Buy on Gumroad</a><p class="small">Then paste your license key:</p><input type="text" id="lic" placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"><button class="btn full" id="verify">Unlock</button><p id="lmsg" class="small"></p>`:'<p><b>Purchasing opens soon.</b></p>'}
 <p class="small">Support and refunds are handled through ${window.NATIVE?'Apple':'Gumroad'}.</p></div>${wall?'<a class="btn alt full" href="#history">View my log</a>':''}`;
const remCard=()=>{const r=S.remind||{};return `<div class="card"><div class="ph"><b>Daily reminder</b><button class="chk2 ${r.on?'on':''}" id="remtog">${r.on?'On':'Off'}</button></div>${r.on?`<input type="time" id="remtime" value="${esc(r.time||'07:00')}" style="margin-top:12px">`:''}</div>`};
V.more=()=>`<h1>More</h1>${window.NATIVE?remCard():''}<a class="btn alt full" href="#results">My personality profile</a><a class="btn alt full" href="#test/0">Retake inventory</a><a class="btn alt full" href="#unlock">${S.license?'License: unlocked ✓':'Unlock full access'}</a><a class="btn alt full" href="#about">About & credits</a>
 <div class="card"><b>Your data</b><p class="small">Stored only in this browser. Clearing browser data erases it.</p><button class="btn alt" id="export">Export backup</button> <button class="btn alt" id="wipe" style="color:#a33;border-color:#a33">Erase everything</button></div>`;
V.about=()=>`<h1>About</h1><p>The WarmUp is a private, on-device tool. No accounts, no servers, no tracking.</p>
<div class="card"><b>Personality inventory</b><p class="small">Items from the IPIP-NEO-120 (Johnson, J. A. 2014, Journal of Research in Personality, 51, 78-89), part of the International Personality Item Pool (Goldberg et al., 2006; ipip.ori.org), which is in the public domain. Result descriptions are original to this app.</p>${DISCLAIMER}</div>
<div class="card"><b>Scripture</b><p class="small">Scripture: World English Bible (public domain).</p><p class="small">This app quotes ${VERSE_COUNT} verses.</p></div>
<div class="card"><b>Safety</b><p class="small">${SAFE}</p><p class="small">${NOTADV}</p></div>
<div class="card"><b>Terms</b><p class="small">Provided as-is.<br>No guarantees of results.<br>For adults 18+, personal use.<br>Use at your own risk.<br>Support and refunds only through ${window.NATIVE?'Apple':'Gumroad'}.</p></div>
<div class="card"><b>Privacy</b><p class="small">Your data stays on this device.<br>${window.NATIVE?'Nothing leaves this device.':'Only your license key goes to Gumroad, to unlock.'}<br>Clearing browser data or losing your phone deletes everything.<br>No analytics or cookies.</p></div>
<p class="small"><a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a> · <a href="support.html">Support</a></p>`;

// ---------- Router ----------
function route(){if(/^#heated/.test(location.hash))return;const [v,arg]=(location.hash.slice(1)||'today').split('/');const fn=V[v]||V.today;app.innerHTML=fn(arg);window.scrollTo(0,0);
 document.querySelectorAll('#tabs a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+v));$('#tabs').classList.toggle('hide',v==='test'||(v==='today'&&!scores()&&!S.started)||v==='welcome');bind(v,arg);const hb=document.getElementById('hbtn');if(hb)hb.classList.toggle('show',v==='today'&&!!(scores()||S.started));if(window.NATIVE&&v==='today'&&S.log[today()])try{const r=S.log[today()],q=ASSIGN_SRC[r.aid],vv=dayVerse(q);Native.widget({verse:VERSES[vv.ref],ref:vv.ref+' WEB',title:q.title,streak:streak(),day:today()})}catch(e){}}
function bind(v,arg){
 app.querySelectorAll('.scale input').forEach(i=>i.onchange=()=>{S.answers[i.name]=+i.value;save();const n=Object.keys(S.answers).length;$('.prog i').style.width=n/1.2+'%'});
 const nx=$('#next');if(nx)nx.onclick=()=>{const p=+arg||0,items=ITEMS.slice(p*PER,p*PER+PER),miss=items.filter(i=>!S.answers[i.id]);if(miss.length){$('#err').textContent=`Please answer all ${miss.length} remaining statement(s) on this page.`;return}
  S.started=true;save();location.hash=p<ITEMS.length/PER-1?'#test/'+(p+1):'#results'};
 app.querySelectorAll('[data-w]').forEach(c=>c.onchange=()=>{const id=c.dataset.w;S.weak=c.checked?[...S.weak,id]:S.weak.filter(x=>x!==id);save();const y=scrollY;route();scrollTo(0,y)});
 const wo=$('#weakOther');if(wo)wo.oninput=()=>{S.weakOther=wo.value;save()};
 const hf=$('#herf');if(hf)hf.onsubmit=e=>{e.preventDefault();const fd=new FormData(hf);S.her={pressures:S.her.pressures||[],name:fd.get('name').trim(),love:fd.getAll('love'),stress:fd.getAll('stress'),season:fd.get('season'),interests:fd.get('interests'),schedule:fd.get('schedule'),notes:fd.get('notes')};
  const r=S.log[today()];if(r&&!r.done&&!r.note)delete S.log[today()];S.started=true;save();location.hash='#today'};
const pb=$('#pbox');if(pb){const redraw=()=>{pb.innerHTML=pressBox();bindP()};const bindP=()=>{
  pb.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{const k=c.dataset.p,L=S.her.pressures,i=L.findIndex(p=>p.k===k);if(i>=0)L.splice(i,1);else L.push({k,w:'week',s:PRESSURE.find(x=>x[0]===k)[2],at:Date.now()});save();redraw()});
  pb.querySelectorAll('.prow .seg button').forEach(b=>b.onclick=()=>{const p=S.her.pressures.find(p=>p.k===b.closest('.prow').dataset.k);p[b.dataset.g]=b.dataset.v;if(b.dataset.g==='w'&&b.dataset.v==='week')p.at=Date.now();save();redraw()})};bindP()}
app.querySelectorAll('[data-pr]').forEach(b=>b.onclick=()=>{const r=S.log[today()];r.pr=r.pr||{};r.pr[b.dataset.pr]=!r.pr[b.dataset.pr];save();const y=scrollY;route();scrollTo(0,y);if(r.pr[b.dataset.pr])hp(b.dataset.pr==='aloud'?'success':'light')});
 const nk=$('#nokids');if(nk)nk.onclick=()=>{S.noKids=true;save();const y=scrollY;route();scrollTo(0,y)};
 const yk=$('#yeskids');if(yk)yk.onclick=()=>{S.noKids=false;save();const y=scrollY;route();scrollTo(0,y)};
const rr=()=>{const y=scrollY;route();scrollTo(0,y)};
 const no=$('#needopen');if(no)no.onclick=()=>{needOpen=true;needDraft={k:'',who:'self'};rr()};
 const nc=$('#needcancel');if(nc)nc.onclick=()=>{needOpen=false;rr()};
 app.querySelectorAll('[data-nk]').forEach(b=>b.onclick=()=>{needDraft.k=b.dataset.nk;const t=($('#neednote')||{}).value;needDraft.note=t;rr();const i=$('#neednote');if(i)i.value=needDraft.note||''});
 app.querySelectorAll('[data-nw]').forEach(b=>b.onclick=()=>{needDraft.who=b.dataset.nw;needDraft.note=($('#neednote')||{}).value;rr();const i=$('#neednote');if(i)i.value=needDraft.note||''});
 const ns=$('#needsave');if(ns)ns.onclick=()=>{const t=($('#neednote')||{}).value||'';if(!needDraft.k){needDraft.note=t;const c=app.querySelector('.need .chips');if(c){c.classList.remove('nudge');void c.offsetWidth;c.classList.add('nudge')}return}S.log[today()].need={k:needDraft.k,who:needDraft.who,note:t.trim().slice(0,80)};needOpen=false;save();rr();hp('medium')};
 const nu=$('#needundo');if(nu)nu.onclick=()=>{delete S.log[today()].need;save();rr()};
const hp=k=>{try{window.Native&&Native.haptic(k)}catch(e){}};
 app.querySelectorAll('[data-share]').forEach(b=>b.onclick=()=>{const a=ASSIGN_SRC[S.log[today()].aid],v=dayVerse(a);hp('light');Native.share(b.dataset.share==='verse'?VERSES[v.ref]+' - '+v.ref+' WEB':makePrayers(a,{seed:today()+a.id,name:'',weak:v.w&&v.w.name,pressure:v.pd,verseRef:v.ref,need:S.log[today()].need}).me+' - The WarmUp')});
 const rt=$('#remtog');if(rt)rt.onclick=async()=>{S.remind=S.remind||{time:'07:00'};const on=!S.remind.on;S.remind.on=on;save();route();hp('light');let ok=false;try{ok=await Native.reminders(on,S.remind.time)}catch(e){}if(on&&!ok){S.remind.on=false;save();route()}};
 const rm=$('#remtime');if(rm)rm.onchange=()=>{S.remind.time=rm.value||'07:00';save();try{Native.reminders(true,S.remind.time)}catch(e){}};
 const ib=$('#iapbuy');if(ib)ib.onclick=()=>{$('#lmsg').textContent='';hp('medium');try{Native.iap.buy()}catch(e){}};
 const ir=$('#iaprestore');if(ir)ir.onclick=()=>{$('#lmsg').textContent='Restoring...';hp('light');try{Native.iap.restore()}catch(e){};setTimeout(()=>{const m=$('#lmsg');if(m&&!S.license)m.textContent='No purchase found.'},6000)};
 const rf=$('#refl');if(rf)rf.oninput=()=>{S.log[today()].note=rf.value;save()};
 const dn=$('#done');if(dn)dn.onclick=()=>{const r=S.log[today()];r.done=!r.done;r.at=Date.now();save();route();if(r.done)hp('success')};
 const vf=$('#verify');if(vf)vf.onclick=verifyLicense;
 const ex=$('#export');if(ex)ex.onclick=()=>{const b=new Blob([JSON.stringify(S,null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='the-warmup-backup.json';a.click()};
 const wp=$('#wipe');if(wp)wp.onclick=()=>{if(confirm('Erase all your answers, notes and history from this device?')){localStorage.removeItem(KEY);localStorage.removeItem('warmup.heated.last');location.hash='';location.reload()}};
}
async function verifyLicense(){const key=$('#lic').value.trim(),m=$('#lmsg');if(!key){m.textContent='Enter your license key.';return}m.textContent='Checking...';
 try{const r=await fetch('https://api.gumroad.com/v2/licenses/verify',{method:'POST',body:new URLSearchParams({product_id:CONFIG.gumroadProductId,license_key:key,increment_uses_count:'false'})});const j=await r.json();
  if(j.success&&!j.purchase.refunded&&!j.purchase.chargebacked){S.license={key,at:Date.now()};save();location.hash='#today';route()}else m.textContent='That key could not be verified. Check it and try again.'}
 catch(e){m.textContent='Could not reach Gumroad. Check your connection and try again.'}}
if(window.NATIVE){Native.iap.on=()=>{if(Native.iap.owned&&!S.license){S.license={iap:true,at:Date.now()};save();location.hash='#today';route()}else if(location.hash==='#unlock')route()};
 if(S.remind&&S.remind.on)try{Native.reminders(true,S.remind.time)}catch(e){}}
window.addEventListener('hashchange',route);route();
})();
