import assert from 'node:assert/strict';
const site = process.env.SITE_URL || 'http://127.0.0.1:4173/';
const target = await fetch('http://127.0.0.1:9223/json/new?about:blank', {method: 'PUT'}).then(r => r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, {once:true}));
let id = 0;
const pending = new Map();
socket.addEventListener('message', event => {
  const m = JSON.parse(event.data);
  if (!m.id) return;
  const p = pending.get(m.id);
  pending.delete(m.id);
  m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result);
});
function command(method, params={}) {
  const serial = ++id;
  return new Promise((resolve,reject) => { pending.set(serial,{resolve,reject}); socket.send(JSON.stringify({id:serial,method,params})); });
}
async function evaluate(expression) {
  const r = await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
async function waitFor(expression) {
  for (let n=0;n<250;n++) {
    if (await evaluate(`Boolean(${expression})`)) return;
    await new Promise(resolve=>setTimeout(resolve,80));
  }
  throw new Error(`Timeout: ${expression}`);
}
try {
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Network.enable');
  await command('Network.setCacheDisabled',{cacheDisabled:true});
  await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
  await command('Page.addScriptToEvaluateOnNewDocument',{source:`window.metrics={lcp:0,cls:0};new PerformanceObserver(l=>{for(const e of l.getEntries())metrics.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)metrics.cls+=e.value}).observe({type:'layout-shift',buffered:true});`});
  await command('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
  await command('Emulation.setCPUThrottlingRate',{rate:4});
  await command('Page.navigate',{url:site});
  await waitFor(`document.querySelector('#start-button') && document.fonts.status === 'loaded' && [...document.images].every(i=>i.complete&&i.naturalWidth)`);
  await new Promise(resolve=>setTimeout(resolve,500));
  const metrics = await evaluate(`({...metrics,ttfb:Math.round(performance.getEntriesByType('navigation')[0].responseStart),resources:performance.getEntriesByType('resource').map(r=>({url:r.name,bytes:r.transferSize,duration:Math.round(r.duration)}))})`);
  console.log('Cold mobile load, simulated 1.6 Mbps / 150ms / 4x CPU:',JSON.stringify(metrics));
  assert.ok(metrics.resources.every(r=>new URL(r.url).origin===locationOrigin()),'all runtime assets must be same-origin');
  function locationOrigin(){return new URL(site).origin;}
  assert.ok(metrics.lcp < 5000, 'simulated mobile LCP must stay under 5 seconds');
  assert.ok(metrics.cls < .1, 'loading layout shifts must stay below .1');
  await command('Emulation.setCPUThrottlingRate',{rate:1});
  await command('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
  // Fonts/images are decorative: the entire questionnaire must still start without them.
  await command('Network.setBlockedURLs',{urls:['*assets/fonts/*','*assets/portraits/*']});
  await command('Page.reload',{ignoreCache:true});
  await waitFor(`document.querySelector('#start-button')`);
  await evaluate(`document.querySelector('#start-button').click()`);
  await waitFor(`document.querySelector('.likert-option')`);
  for(const width of [320,390,430]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`),true,`fallback question fits ${width}px`);
  }
  await evaluate(`document.documentElement.style.fontSize='200%'`);
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`),true,'answer page must support enlarged text');
  await evaluate(`sessionStorage.clear()`);
  // A failed bank request must offer a working retry, not a stranded page.
  await command('Network.setBlockedURLs',{urls:['*question_bank.json*']});
  await command('Page.reload',{ignoreCache:true});
  await waitFor(`document.querySelector('#recover')`);
  await command('Network.setBlockedURLs',{urls:[]});
  await evaluate(`document.querySelector('#recover').click()`);
  await waitFor(`document.querySelector('#start-button')`);
  console.log('PASS same-origin loading, missing-media fallback, enlarged text, and failed-load recovery');
} finally {
  socket.close();
  await fetch(`http://127.0.0.1:9223/json/close/${target.id}`);
}
