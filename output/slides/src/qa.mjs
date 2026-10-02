import assert from 'node:assert/strict';
import fs from 'node:fs';
const url='file://'+new URL('../romantic16-classroom.html',import.meta.url).pathname;
const out='/tmp/romantic16-slides-qa';
const target=await fetch('http://127.0.0.1:9337/json/new?'+encodeURIComponent(url),{method:'PUT'}).then(r=>r.json());
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let seq=0;const waiters=new Map(),errors=[],requests=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=waiters.get(m.id);if(p){waiters.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);});
const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;waiters.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const ev=async expression=>{const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
const ready=async()=>{for(let i=0;i<100;i++){if(await ev('Boolean(globalThis.ROMANTIC16_SLIDES)'))return;await new Promise(r=>setTimeout(r,50));}throw Error('No deck initialized');};
await cmd('Page.enable');await cmd('Runtime.enable');await cmd('Network.enable');await cmd('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});await cmd('Page.navigate',{url});await ready();await ev('document.fonts.ready');await ev('document.body.classList.add("motion-off")');
assert.equal(await ev('ROMANTIC16_SLIDES.count'),26);assert.equal(await ev('ROMANTIC16_SLIDES.characters.length'),16);
assert.equal(await ev('ROMANTIC16_SLIDES.durations.reduce((a,b)=>a+b)'),730);
const reports=[];
async function shot(name){const r=await cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(`${out}/${name}.png`,Buffer.from(r.data,'base64'));}
for(const [width,height] of [[1920,1080],[1366,768]]){
 await cmd('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 for(let i=0;i<26;i++){
  await ev(`ROMANTIC16_SLIDES.go(${i});document.fonts.ready`);
  await ev(`Promise.all([...document.querySelectorAll('.slide.active img')].map(img=>img.decode().catch(()=>{})))`);
  const layout=await ev(`(()=>{const s=document.querySelector('.slide.active'),r=s.getBoundingClientRect();const bad=[...s.querySelectorAll('h1,h2,h3,p,button,.char-balance,.row-actions,.atlas-grid,.ref-layout')].filter(e=>{const b=e.getBoundingClientRect();return b.left<r.left-1||b.right>r.right+1||b.bottom>r.bottom-37||b.top<r.top-1;}).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,45),bottom:Math.round(e.getBoundingClientRect().bottom-r.top)}));return {bad,images:[...s.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth),width:document.documentElement.scrollWidth,viewport:innerWidth};})()`);
  reports.push({size:`${width}x${height}`,slide:i+1,...layout});
  await shot(`${width}-slide-${String(i+1).padStart(2,'0')}`);
 }
}
fs.writeFileSync(`${out}/desktop.json`,JSON.stringify(reports,null,2));
await ev('ROMANTIC16_SLIDES.go(5)');
assert.equal(await ev('document.querySelector("#reveal").disabled'),true);
await ev('document.querySelector("[data-choice=FREE]").click()');assert.equal(await ev('ROMANTIC16_SLIDES.read().best'),'FREE');
await ev('document.querySelector("[data-choice=FREE]").click()');assert.equal(await ev('ROMANTIC16_SLIDES.read().worst'),null);
await ev('document.querySelector("[data-choice=RULE]").click()');assert.equal(await ev('ROMANTIC16_SLIDES.read().worst'),'RULE');
await ev('document.querySelector("#reveal").click()');assert.equal(await ev('ROMANTIC16_SLIDES.read().revealed'),true);
assert.equal(await ev('[...document.querySelectorAll(".choice .tag")].every(e=>e.textContent.includes(" · "))'),true);
await shot('demo-revealed');await ev('document.querySelector("[data-action=reset-demo]").click()');assert.equal(await ev('ROMANTIC16_SLIDES.read().best'),null);
for(let i=0;i<16;i++){
 await ev(`ROMANTIC16_SLIDES.go(${i+8});document.querySelector('.slide.active [data-detail]').click()`);
 assert.equal(await ev('!document.querySelector("#overlay").hidden'),true);
 for(const tab of ['analysis','reflection','sources']){await ev(`document.querySelector('[data-tab-switch=${tab}]').click()`);assert.equal(await ev(`document.querySelector('[data-tab-switch=${tab}]').getAttribute('aria-selected')`),'true');}
 if(i===0)await shot('detail-source');
 await ev('document.querySelector(".close").click()');
}
await ev('ROMANTIC16_SLIDES.go(0)');await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});assert.equal(await ev('ROMANTIC16_SLIDES.read().index'),1);
await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'g',code:'KeyG'});assert.equal(await ev('!document.querySelector("#overlay").hidden'),true);
await ev('document.querySelectorAll(".overview-list button")[23].click()');assert.equal(await ev('ROMANTIC16_SLIDES.read().index'),23);
await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'n',code:'KeyN'});assert.equal(await ev('document.querySelector("#dialog-content").textContent.includes("波尔托斯")'),true);
await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});assert.equal(await ev('document.querySelector("#overlay").hidden'),true);
// Mobile: scroll the slide, keep controls fixed, and ensure content stays inside the viewport.
await cmd('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
const mobile=[];
for(let i=0;i<26;i++){
 await ev(`ROMANTIC16_SLIDES.go(${i})`);
 const r=await ev(`({width:document.documentElement.scrollWidth,viewport:innerWidth,images:[...document.querySelectorAll('.slide.active img')].every(i=>i.complete&&i.naturalWidth)})`);mobile.push({slide:i+1,...r});assert.ok(r.width<=r.viewport+1,`mobile overflow slide ${i+1}`);
 if([0,5,7,8,17,24,25].includes(i))await shot(`mobile-${i+1}`);
}
// A real gesture opens the second file window; subsequent state travels via postMessage.
await cmd('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});await ev('ROMANTIC16_SLIDES.go(9)');
const pos=await ev(`(()=>{const r=document.querySelector('[data-action=speaker]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
await cmd('Input.dispatchMouseEvent',{type:'mousePressed',...pos,button:'left',clickCount:1});await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',...pos,button:'left',clickCount:1});
await new Promise(r=>setTimeout(r,800));
const targets=await fetch('http://127.0.0.1:9337/json/list').then(r=>r.json());const speaker=targets.find(t=>t.url.includes('presenter=1'));
assert.ok(speaker,'presenter window opens');
const sws=new WebSocket(speaker.webSocketDebuggerUrl);await new Promise(r=>sws.addEventListener('open',r,{once:true}));let sid=0;const swait=new Map();sws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=swait.get(m.id);if(p){swait.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}});
const scmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++sid;swait.set(id,{resolve,reject});sws.send(JSON.stringify({id,method,params}));});
const sev=async expression=>{const r=await scmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
await new Promise(r=>setTimeout(r,700));assert.equal(await sev('ROMANTIC16_SLIDES.read().index'),9);
await ev('ROMANTIC16_SLIDES.go(17)');await new Promise(r=>setTimeout(r,500));assert.equal(await sev('ROMANTIC16_SLIDES.read().index'),17);
await sev('document.querySelector("[data-action=prev]").click()');await new Promise(r=>setTimeout(r,500));assert.equal(await ev('ROMANTIC16_SLIDES.read().index'),16);
await sev('document.querySelector("[data-action=timer-reset]").click()');await new Promise(r=>setTimeout(r,100));
if(!await sev('ROMANTIC16_SLIDES.read().running'))await sev('document.querySelector("[data-action=timer]").click()');
await new Promise(r=>setTimeout(r,1200));assert.ok(await ev('ROMANTIC16_SLIDES.read().elapsed')>=1);
await sev('document.querySelector("[data-action=timer]").click()');await new Promise(r=>setTimeout(r,200));assert.equal(await ev('ROMANTIC16_SLIDES.read().running'),false);
await scmd('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
const sr=await scmd('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${out}/speaker.png`,Buffer.from(sr.data,'base64'));
await cmd('Emulation.setEmulatedMedia',{media:'print'});const pdf=await cmd('Page.printToPDF',{printBackground:true,preferCSSPageSize:true});fs.writeFileSync(`${out}/notes.pdf`,Buffer.from(pdf.data,'base64'));await cmd('Emulation.setEmulatedMedia',{media:''});
assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(requests.filter(u=>/^https?:/.test(u)).length,0,'no network requests required');
assert.equal(reports.filter(r=>r.bad.length).length,0,'all desktop contents fit');
const report={desktop:reports,mobile,errors:errors.length,networkRequests:requests.filter(u=>/^https?:/.test(u)),interaction:'passed',speaker:'passed',print:'generated'};
fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({layoutIssues:reports.filter(r=>r.bad.length),mobile:'26 passed',interactions:'passed',speaker:'passed',offline:'passed',errors:errors.length},null,2));
sws.close();ws.close();
