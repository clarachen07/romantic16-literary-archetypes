import assert from 'node:assert/strict';
import fs from 'node:fs';
const target = await fetch('http://127.0.0.1:9223/json/new?about:blank', {method:'PUT'}).then(r=>r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
let serial=0; const pending=new Map();
socket.addEventListener('message',event=>{
  const message=JSON.parse(event.data);
  if(!message.id)return;
  const p=pending.get(message.id); pending.delete(message.id);
  message.error?p.reject(new Error(message.error.message)):p.resolve(message.result);
});
const command=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description);return r.result.value;}
async function waitFor(expression){for(let i=0;i<200;i++){if(await evaluate(`Boolean(${expression})`))return;await new Promise(r=>setTimeout(r,80));}throw new Error(`Timed out: ${expression}`);}
async function open(status='focused',codes=['FREE']){
  await evaluate(`(async()=>{const {openSharePoster}=await import('./share.mjs');const {profiles}=await import('./profiles.mjs');openSharePoster({status:${JSON.stringify(status)},profiles:${JSON.stringify(codes)}.map(c=>profiles[c])},document.querySelector('#start-button'))})()`);
}
async function close(){await evaluate(`document.querySelector('.share-close').click()`);}
try{
  await command('Page.enable');await command('Runtime.enable');await command('Network.enable');
  await command('Network.setCacheDisabled',{cacheDisabled:true});
  await command('Page.navigate',{url:'http://127.0.0.1:4173/'});
  await waitFor(`document.querySelector('#start-button')`);
  await evaluate(`window.shareCalls=[];Object.defineProperty(navigator,'canShare',{configurable:true,writable:true,value:({files})=>files?.[0]?.type==='image/png'});Object.defineProperty(navigator,'share',{configurable:true,writable:true,value:async({files})=>{shareCalls.push(files.map(f=>({name:f.name,type:f.type,size:f.size})))}})`);
  await open();await waitFor(`document.querySelector('.poster-preview')?.complete`);
  assert.equal(await evaluate(`document.querySelector('.native-share').hidden`),false);
  await evaluate(`document.querySelector('.native-share').click()`);
  await waitFor(`shareCalls.length===1`);
  const file=(await evaluate('shareCalls'))[0][0];
  assert.equal(file.type,'image/png');assert.ok(file.size>100000);assert.match(file.name,/FREE/);
  // Cancel is not reported as a sent message, and denied sharing retains the image.
  await evaluate(`navigator.share=async()=>{throw new DOMException('Canceled','AbortError')};document.querySelector('.native-share').click()`);
  await waitFor(`document.querySelector('.share-feedback').textContent.includes('已取消')`);
  await evaluate(`navigator.share=async()=>{throw new DOMException('Denied','NotAllowedError')};document.querySelector('.native-share').click()`);
  await waitFor(`document.querySelector('.share-feedback').textContent.includes('请保存海报')`);
  assert.equal(await evaluate(`document.querySelector('.native-share').disabled`),false);
  await evaluate(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedURL=text}}});document.querySelector('.copy-questionnaire').click()`);
  await waitFor(`window.copiedURL`);
  assert.equal(await evaluate('copiedURL'),'https://romantic16.netlify.app/');
  const directory='/tmp/romantic16-share-downloads';fs.mkdirSync(directory,{recursive:true});
  await command('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:directory});
  await evaluate(`document.querySelector('.save-poster').click()`);
  for(let i=0;i<100&&!fs.existsSync(`${directory}/${file.name}`);i++)await new Promise(r=>setTimeout(r,50));
  assert.equal(fs.readFileSync(`${directory}/${file.name}`).subarray(1,4).toString(),'PNG');
  for(const width of [320,430]){
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
    assert.equal(await evaluate(`document.querySelector('.share-dialog').scrollWidth<=document.querySelector('.share-dialog').clientWidth`),true);
  }
  await evaluate(`document.documentElement.style.fontSize='200%'`);
  assert.equal(await evaluate(`document.querySelector('.share-dialog').scrollWidth<=document.querySelector('.share-dialog').clientWidth`),true);
  await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
  await waitFor(`!document.querySelector('.share-dialog')`);
  assert.equal(await evaluate('document.activeElement.id'),'start-button');
  await evaluate(`document.documentElement.style.fontSize='';navigator.canShare=()=>false;Object.defineProperty(navigator,'userAgent',{configurable:true,value:'MicroMessenger/8.0'});`);
  await open('dual',['LOVE','OATH']);await waitFor(`document.querySelector('.poster-preview')?.complete`);
  assert.equal(await evaluate(`document.querySelector('.native-share').hidden`),true);
  assert.match(await evaluate(`document.querySelector('.poster-help').textContent`),/微信内.*长按/);
  await close();
  await command('Network.setBlockedURLs',{urls:['*questionnaire-qr.png*']});
  await open();await waitFor(`document.querySelector('.retry-poster')?.hidden===false`);
  assert.equal(await evaluate(`document.querySelector('.poster-actions').hidden`),true);
  await command('Network.setBlockedURLs',{urls:[]});
  await evaluate(`document.querySelector('.retry-poster').click()`);
  await waitFor(`document.querySelector('.poster-preview')?.complete`);
  await close();
  // Early close aborts work and leaves no stale overlay or locked page.
  await open();await close();
  assert.equal(await evaluate(`document.querySelector('.share-dialog')===null&&!document.body.classList.contains('share-open')`),true);
  console.log('PASS native-share payload/cancel/denied mocks, real PNG download, URL copy, WeChat fallback, 320px/200% text, QR failure/retry, Escape and early-close cleanup');
}finally{socket.close();await fetch(`http://127.0.0.1:9223/json/close/${target.id}`);}
