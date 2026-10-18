(function(){
const root=document.createElement('div');root.id='heated';document.body.appendChild(root);
const KEY='warmup.heated.last';
const WEBV=[["Galatians 5:22-23","But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith, gentleness, and self-control. Against such things there is no law.","h16-verse-gal"],
["2 Timothy 1:7","For God didn’t give us a spirit of fear, but of power, love, and self-control.","h17-verse-2ti"],
["Romans 8:6","For the mind of the flesh is death, but the mind of the Spirit is life and peace.","h18-verse-rom6"],
["Romans 8:26","In the same way, the Spirit also helps our weaknesses, for we don’t know how to pray as we ought. But the Spirit himself makes intercession for us with groanings which can’t be uttered.","h19-verse-rom26"]];
const TIPS=[["You do not have to win this. Be quiet for one minute.","h03-tip1"],["Name it: I am angry. Not: she is wrong.","h04-tip2"],["Her words are not the enemy. The heat is.","h05-tip3"],["Unclench your jaw. Drop your shoulders.","h06-tip4"],["Do not rehearse your argument. Pause the replay.","h07-tip5"]];
const LOCS=[["I'll be outside","h09-loc-outside"],["I'll be in the garage","h10-loc-garage"],["I'll be in the car","h11-loc-car"],["I'll be on a walk","h12-loc-walk"]];
const GIFT="Self-control is the Spirit's gift.";
let st={},timers=[],muted=false,au=new Audio();au.preload='auto';let q=[];
const ld=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
const sv=o=>{try{localStorage.setItem(KEY,JSON.stringify(Object.assign(ld(),o)))}catch(e){}};
const clr=()=>{timers.forEach(clearTimeout);timers.forEach(clearInterval);timers=[]};
const T=(f,ms)=>{const t=setTimeout(f,ms);timers.push(t);return t};
function say(ids){q=[].concat(ids);next()}
function next(){if(muted||!q.length)return;const id=q.shift();au.src='audio/heated/'+id+'.mp3';au.onended=next;const p=au.play();if(p&&p.catch)p.catch(()=>{q=[]})}
function stopAudio(){q=[];try{au.pause()}catch(e){}}
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const NM='Not medical advice.';
function frame(theme,body,opts){opts=opts||{};root.className='on '+theme;
 root.innerHTML=`<div class="top"><button id="hx" aria-label="Close">✕</button><button id="hm" class="mute" aria-label="Sound">${muted?'🔇':'🔊'}</button></div><div class="mid">${body}</div><div class="foot">${opts.foot||NM}${opts.safe===false?'':'<br><button class="lnk" data-go="safety">I might hurt someone</button>'}</div>`;
 root.querySelector('#hx').onclick=exit;root.querySelector('#hm').onclick=()=>{muted=!muted;if(muted)stopAudio();root.querySelector('#hm').textContent=muted?'🔇':'🔊'};
 root.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go))}
function exit(){clr();stopAudio();root.className='';root.innerHTML='';if(location.hash.startsWith('#heated'))location.hash='#today'}
function go(s){clr();stopAudio();S[s]()}
const S={};
S.entry=()=>{frame('red',`<h1>HEATED?!?</h1><button class="big" id="go">TAP TO COOL DOWN</button><p class="sm">About 2 minutes. Eyes open. Not while driving.</p><p class="sm">Turn sound on. Check silent switch.</p>`,{foot:'Self-help tool. Not medical advice, therapy, or emergency care.<br>Voice is AI-generated.<br>Scripture: World English Bible (public domain).'});
 root.querySelector('#go').onclick=()=>{au.src='audio/heated/h01-breathe-in.mp3';au.play&&au.play().then(()=>{au.pause();au.currentTime=0}).catch(()=>{});S.breathe()}};
S.breathe=()=>{frame('red',`<div class="circ" id="c">IN</div><div class="bar"><i id="b"></i></div><p class="sm">Out is longer than in.</p><button class="big ghost" id="sk">NEXT</button>`);
 const c=root.querySelector('#c'),b=root.querySelector('#b'),rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
 root.querySelector('#sk').onclick=()=>go('tip');
 // calm red: bright to deep over the breathing minute
 requestAnimationFrame(()=>requestAnimationFrame(()=>{root.className='on deep'}));
 let n=0;const cycle=()=>{if(n>=6){go('tip');return}
  window.Native&&Native.haptic('light');c.textContent='IN';c.style.transition='transform 4s ease-in-out';c.style.transform='scale(1)';b.style.transition='width 4s linear';b.style.width='100%';
  if(n<2)say('h01-breathe-in');
  T(()=>{window.Native&&Native.haptic('light');c.textContent='OUT';c.style.transition='transform 6s ease-in-out';c.style.transform='scale(.55)';b.style.transition='width 6s linear';b.style.width='0';if(n<2)say('h02-slowly-out')},4000);
  T(()=>{n++;cycle()},10000)};T(cycle,300)};
S.tip=()=>{const l=ld(),i=((l.tip===undefined?-1:l.tip)+1)%TIPS.length;sv({tip:i});const t=TIPS[i];
 frame('deep2',`<p style="font-size:30px;font-weight:700">${e(t[0])}</p><button class="big" id="n">NEXT</button>`);say(t[1]);root.querySelector('#n').onclick=()=>go('ask')};
S.ask=()=>{frame('deep2',`<h2>IS SHE HERE?</h2><div class="row"><button class="big" id="y">YES</button><button class="big" id="no">NO</button></div>`);
 root.querySelector('#y').onclick=()=>go('away');root.querySelector('#no').onclick=()=>{const l=ld(),order=['cold','ground','squeeze','verse'];let i=order.indexOf(l.ex);i=(i+1)%order.length;sv({ex:order[i]});go(order[i])}};
S.away=()=>{let loc=-1;const R=()=>{frame('deep2',`<p style="font-size:30px;font-weight:700">I'm getting too heated. I need 20 minutes. I will come back.${loc>=0?' '+e(LOCS[loc][0])+'.':''}</p><div class="chips">${LOCS.map((x,i)=>`<button class="chip ${loc===i?'on':''}" data-l="${i}">${e(x[0].replace("I'll be ",''))}</button>`).join('')}</div><button class="big" id="n">NEXT</button>`);
  root.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{const i=+b.dataset.l;loc=loc===i?-1:i;R();say(loc>=0?['h08-step-away',LOCS[loc][1]]:'h08-step-away')});
  root.querySelector('#n').onclick=()=>go('cool')};R();say('h08-step-away')};
const ex=(txt,id,extra)=>()=>{frame('deep2',`<p style="font-size:30px;font-weight:700">${txt}</p>${extra?`<p class="sm">${extra}</p>`:''}<button class="big" id="n">NEXT</button>`);say(id);root.querySelector('#n').onclick=()=>go('cool')};
S.cold=ex('Hold cold water on your cheeks and under your eyes for 15 to 30 seconds.','h13-cold-water','Skip if you have a heart condition or feel faint.');
S.ground=ex('Look around.<br>Name 5 things you see.<br>4 things you feel.<br>3 things you hear.','h14-grounding');
S.squeeze=ex('Squeeze your fists 5 seconds. Drop.<br>Shoulders up 5 seconds. Drop.<br>Jaw tight 5 seconds. Drop.','h15-squeeze');
S.verse=()=>{const l=ld(),i=((l.vs===undefined?-1:l.vs)+1)%WEBV.length;sv({vs:i,vdone:i});const v=WEBV[i];
 frame('deep2',`<p class="v">${e(v[1])}<span class="ref">${e(v[0])} WEB</span></p><p style="font-weight:700">${e(GIFT)}</p><button class="big" id="n">NEXT</button>`,{foot:NM+'<br>Scripture: World English Bible (public domain).'});say([v[2],'h20-spirit-gift']);root.querySelector('#n').onclick=()=>go('cool')};
S.cool=()=>{const l=ld();let i=((l.cv===undefined?-1:l.cv)+1)%WEBV.length;if(l.vdone===i)i=(i+1)%WEBV.length;sv({cv:i});const v=WEBV[i];
 frame('blue',`<h1>COOL DOWN</h1><p class="v">${e(v[1])}<span class="ref">${e(v[0])} WEB</span></p><p style="font-weight:700">${e(GIFT)}</p><p class="sm" style="font-size:19px">Take 20 minutes or more. Walk. Water. Quiet.<br>Do not replay it. Talk again when calm.</p><button class="big" id="s">START 20-MIN BREAK</button><button class="lnk" id="d">DONE</button><div class="card"><b>When you are calm</b><br>I got heated. I'm sorry. Can we talk when I'm calm?</div>`,{foot:NM+'<br>Scripture: World English Bible (public domain).',safe:false});
 say([v[2],'h20-spirit-gift','h21-cooldown-1','h22-cooldown-2']);root.querySelector('#s').onclick=()=>go('brk');root.querySelector('#d').onclick=exit};
S.brk=()=>{let left=1200;const f=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
 frame('blue',`<h1 id="t">${f(left)}</h1><p>Walk. Water. Quiet.</p><p class="sm">Keep this screen open or set a phone timer.</p><button class="big" id="d">DONE</button>`,{foot:NM,safe:false});
 const t=setInterval(()=>{left--;const el=root.querySelector('#t');if(el)el.textContent=f(Math.max(0,left));if(left<=0){clearInterval(t);if(el)el.textContent='Break done'}},1000);timers.push(t);
 root.querySelector('#d').onclick=exit};
S.safety=()=>{frame('red',`<h2>Stop.<br>Step away from the person.<br>Go somewhere safe.</h2><div class="stack"><a class="big btnl" style="line-height:40px" href="tel:911">Call 911</a><p class="lab">Outside the US, use your local emergency number.</p>
 <a class="big btnl" style="line-height:30px;padding:12px" href="tel:18007997233">National Domestic Violence Hotline<br><span style="font-size:15px;font-weight:600">Call 1-800-799-7233</span></a><a class="big btnl ghost" style="line-height:44px;min-height:52px" href="sms:88788?&body=START">Text START to 88788</a><p class="lab">Talk to someone about your anger or how you treat your partner.</p>
 <div class="row"><a class="big btnl" style="line-height:40px" href="tel:988">Call 988</a><a class="big btnl ghost" style="line-height:40px" href="sms:988">Text 988</a></div><p class="lab">If you're in crisis or thinking of hurting yourself.</p>
 <button class="big ghost" id="cd">COOL DOWN</button></div>`,{foot:NM,safe:false});say('h23-safety');root.querySelector('#cd').onclick=()=>go('breathe')};
function route(){const on=/^#heated/.test(location.hash);if(on){clr();stopAudio();S.entry()}else if(root.className){clr();stopAudio();root.className='';root.innerHTML=''}}
window.addEventListener('hashchange',route);route();
})();
