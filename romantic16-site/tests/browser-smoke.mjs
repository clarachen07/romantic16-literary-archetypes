import assert from 'node:assert/strict';
import fs from 'node:fs';
import {analyze, nextQuestion} from '../dist/engine.mjs';

const bank = JSON.parse(fs.readFileSync(new URL('../dist/question_bank.json', import.meta.url), 'utf8'));

const debugPort = Number(process.env.CHROME_DEBUG_PORT || 9223);
const site = process.env.SITE_URL || 'http://127.0.0.1:4173/';
const screenshotDir = process.env.SCREENSHOT_DIR || '/tmp/romantic16-finalqa';

const target = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(site)}`, {method: 'PUT'}).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, {once: true});
  socket.addEventListener('error', reject, {once: true});
});

let serial = 0;
const pending = new Map();
const consoleErrors = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.exceptionThrown') consoleErrors.push(message.params.exceptionDetails.text);
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') consoleErrors.push(message.params.entry.text);
});

function command(method, params = {}) {
  const id = ++serial;
  socket.send(JSON.stringify({id, method, params}));
  return new Promise((resolve, reject) => pending.set(id, {resolve, reject}));
}

async function evaluate(expression, {awaitPromise = true} = {}) {
  const result = await command('Runtime.evaluate', {expression, awaitPromise, returnByValue: true});
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, timeout = 8000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(`Boolean(${expression})`)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function navigate(url = site) {
  await command('Page.navigate', {url});
  await waitFor(`document.readyState === 'complete' && globalThis.__ROMANTIC16_TEST__`);
}

async function screenshot(name, fullPage = true) {
  await evaluate(`Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})))`);
  let clip;
  if (fullPage) {
    const metrics = await command('Page.getLayoutMetrics');
    clip = {...metrics.cssContentSize, scale: 1};
  }
  const result = await command('Page.captureScreenshot', {format: 'png', fromSurface: true, captureBeyondViewport: fullPage, ...(clip ? {clip} : {})});
  fs.mkdirSync(screenshotDir, {recursive: true});
  fs.writeFileSync(`${screenshotDir}/${name}.png`, Buffer.from(result.data, 'base64'));
}

async function current() {
  return evaluate(`globalThis.__ROMANTIC16_TEST__.readCurrentQuestion()`);
}

async function verifyPoster(status) {
  await evaluate(`document.querySelector('#share-result').click()`);
  await waitFor(`document.querySelector('.poster-preview')?.complete`, 20000);
  assert.equal(await evaluate(`document.querySelector('.poster-preview').naturalWidth`), 1080);
  assert.equal(await evaluate(`document.querySelector('.poster-preview').naturalHeight`), 1800);
  const data = await evaluate(`(async () => {
    const blob = await fetch(document.querySelector('.poster-preview').src).then(r => r.blob());
    return await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(blob); });
  })()`);
  fs.mkdirSync(screenshotDir, {recursive: true});
  fs.writeFileSync(`${screenshotDir}/poster-${status}.png`, Buffer.from(data.split(',')[1], 'base64'));
  assert.equal(await evaluate(`document.querySelector('.save-poster').download.endsWith('.png')`), true);
  assert.equal(await evaluate(`document.querySelector('.share-dialog').scrollWidth <= document.querySelector('.share-dialog').clientWidth`), true, 'share dialog must not overflow');
  await screenshot(`share-${status}-dialog`, false);
  await evaluate(`document.querySelector('.share-close').click()`);
  assert.equal(await evaluate(`document.querySelector('.share-dialog') === null && !document.body.classList.contains('share-open')`), true);
  assert.equal(await evaluate(`document.activeElement.id`), 'share-result', 'closing sharing restores focus');
}

async function answer(response) {
  const question = await current();
  assert.equal(question.status, 'question');
  return evaluate(`globalThis.__ROMANTIC16_TEST__.answerCurrentQuestion(${JSON.stringify({questionId: question.questionId, response})})`);
}

await command('Page.enable');
await command('Runtime.enable');
await command('Log.enable');
await command('Network.enable');
await command('Network.setCacheDisabled', {cacheDisabled: true});
await command('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
await navigate();

assert.equal(await evaluate(`document.body.dataset.view`), 'intro');
assert.equal(await evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), true, 'mobile intro must not overflow horizontally');
assert.equal(await evaluate(`document.querySelector('.page-panel').getBoundingClientRect().right <= innerWidth`), true, 'intro panel must fit the mobile viewport');
await screenshot('intro-mobile-cdp');
for (const width of [320, 430, 768, 1440]) {
  await command('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 621});
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `intro must fit ${width}px`);
  if (width === 1440) await screenshot('intro-desktop-cdp');
}
await command('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});

await evaluate(`document.querySelector('#start-button').click()`);
await waitFor(`document.body.dataset.view === 'questionnaire'`);
assert.equal((await current()).kind, 'anchor');
assert.equal((await current()).options.length, 5, 'anchors must expose only the five scored choices');
assert.equal(await evaluate(`document.querySelector('.skip-button') === null`), true, 'anchors must not offer a skip choice');
await screenshot('question-mobile-cdp');

const fourthOption = await evaluate(`(() => {
  const rect = document.querySelector('.likert-option[data-choice="4"]').getBoundingClientRect();
  return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
})()`);
await command('Input.dispatchMouseEvent', {type: 'mouseMoved', x: fourthOption.x - 12, y: fourthOption.y});
await command('Input.dispatchMouseEvent', {type: 'mouseMoved', x: fourthOption.x, y: fourthOption.y});
assert.equal(await evaluate(`document.body.dataset.hoverReady`), 'true', 'moving onto an answer enables its hover hint');
await command('Input.dispatchMouseEvent', {type: 'mousePressed', x: fourthOption.x, y: fourthOption.y, button: 'left', clickCount: 1});
await command('Input.dispatchMouseEvent', {type: 'mouseReleased', x: fourthOption.x, y: fourthOption.y, button: 'left', clickCount: 1});
await waitFor(`globalThis.__ROMANTIC16_TEST__.readCurrentQuestion().questionId === 'question-2'`);
assert.equal(await evaluate(`document.body.dataset.hoverReady`), 'false', 'a new question must reset the previous hover state');
assert.equal(await evaluate(`(() => {
  const options = [...document.querySelectorAll('.likert-option')];
  return options.every((option) => getComputedStyle(option).borderLeftColor === getComputedStyle(options[0]).borderLeftColor);
})()`), true, 'all answers on the next question must look unselected');
for (let index = 1; index < 15; index += 1) await answer({value: index % 2 ? 4 : 5});
assert.equal((await current()).kind, 'core');
assert.equal(await evaluate(`document.querySelector('.skip-button') === null`), true, 'core scenes must not offer a skip choice');
await screenshot('core-mobile-cdp');
await evaluate(`window.scrollTo(0, 120)`);
const coreScroll = await evaluate(`scrollY`);
await evaluate(`document.querySelector('.scene-option[data-choice="0"]').click()`);
assert.equal(await evaluate(`document.querySelectorAll('.scene-option--best').length`), 1);
assert.equal(await evaluate(`scrollY`), coreScroll, 'the two steps of one scene must preserve the reading position');
await screenshot('core-selected-mobile-cdp');
await evaluate(`document.querySelector('.revise-best').click()`);
for (let index = 0; index < 8; index += 1) await answer({best: 'choice-1', worst: 'choice-2'});
assert.equal((await current()).kind, 'adaptive');
assert.deepEqual((await current()).options.map((option) => option.id), ['a', 'b', 'equal'], 'follow-ups must not expose an undecidable choice');
assert.equal(await evaluate(`document.querySelector('.pair-option--neither') === null`), true);
assert.equal(await evaluate(`getComputedStyle(document.querySelector('.pair-option--equal')).gridTemplateColumns.split(' ').length === 1`), true, 'mobile equal choice must use a full-width single column');
await screenshot('adaptive-mobile-cdp');
while ((await current()).status === 'question') await answer({value: 'a'});

await waitFor(`document.body.dataset.view === 'result'`);
assert.equal(await evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), true, 'mobile result must not overflow horizontally');
await waitFor(`[...document.images].every((image) => image.complete && image.naturalWidth > 0)`);
const resultStatus = (await current()).resultStatus;
assert.ok(['focused', 'dual', 'distributed'].includes(resultStatus));
await screenshot('result-mobile-cdp');

await evaluate(`document.querySelector('#edit-result').click()`);
assert.equal((await current()).status, 'question', 'result must support returning to the last answer');
const revised = await current();
await answer(revised.kind === 'adaptive' ? {value: 'b'} : revised.kind === 'core' ? {best: 'choice-2', worst: 'choice-1'} : {value: 3});
while ((await current()).status === 'question') await answer({value: 'b'});
assert.equal((await current()).status, 'result');

await command('Page.reload', {ignoreCache: true});
await waitFor(`document.readyState === 'complete' && globalThis.__ROMANTIC16_TEST__ && document.body.dataset.view === 'result'`);
assert.equal((await current()).status, 'result', 'session result must survive refresh');

await command('Emulation.setDeviceMetricsOverride', {width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false});
await waitFor(`innerWidth === 1440`);
assert.equal(await evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), true, 'desktop result must not overflow horizontally');
await screenshot('result-desktop-cdp');

await evaluate(`sessionStorage.clear()`);
const legacySkipped = {
  version: bank.version,
  seed: 'legacy-skipped-answers',
  started: true,
  anchors: Object.fromEntries(bank.anchors.map((question) => [question.id, null])),
  core: Object.fromEntries(bank.core_scenes.map((question) => [question.id, null])),
  adaptive: [],
  history: [],
  snapshots: {},
  draft: null
};
while (true) {
  const question = nextQuestion(bank, legacySkipped, legacySkipped.seed);
  if (!question) break;
  assert.equal(question.kind, 'adaptive');
  legacySkipped.adaptive.push({a: question.a, b: question.b, format: question.format, source: question.source, answer: 'neither'});
}
await evaluate(`sessionStorage.setItem('romantic16:v0.1:session', ${JSON.stringify(JSON.stringify(legacySkipped))})`);
await command('Page.reload', {ignoreCache: true});
await waitFor(`document.readyState === 'complete' && globalThis.__ROMANTIC16_TEST__ && document.body.dataset.view === 'result'`);
assert.equal((await current()).resultStatus, 'insufficient', 'older skipped answers must still load without losing the result');
assert.match(await evaluate(`document.querySelector('.insufficient-card')?.textContent || ''`), /不急着替你定型/);
await verifyPoster('insufficient');

let randomState = 240921;
const random = () => ((randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const samples = new Map();
for (let run = 0; run < 1200 && samples.size < 3; run += 1) {
  const seed = `render-state-${run}`;
  const input = {
    version: bank.version,
    seed,
    started: true,
    anchors: Object.fromEntries(bank.anchors.map((question) => [question.id, 1 + Math.floor(random() * 5)])),
    core: {},
    adaptive: [],
    history: [],
    snapshots: {},
    draft: null
  };
  for (const scene of bank.core_scenes) {
    const best = Math.floor(random() * scene.options.length);
    let worst = Math.floor(random() * (scene.options.length - 1));
    if (worst >= best) worst += 1;
    input.core[scene.id] = {best: scene.options[best].type, worst: scene.options[worst].type};
  }
  while (true) {
    const question = nextQuestion(bank, input, seed);
    if (!question) break;
    input.adaptive.push({a: question.a, b: question.b, format: question.format, source: question.source, answer: ['a', 'b', 'equal'][Math.floor(random() * 3)]});
  }
  const result = analyze(bank, input, seed);
  if (['focused', 'dual', 'distributed'].includes(result.status) && !samples.has(result.status)) samples.set(result.status, input);
}
assert.deepEqual([...samples.keys()].sort(), ['distributed', 'dual', 'focused'], 'synthetic paths must cover every substantive result state');

for (const [status, sample] of samples) {
  await evaluate(`sessionStorage.setItem('romantic16:v0.1:session', ${JSON.stringify(JSON.stringify(sample))})`);
  await command('Page.reload', {ignoreCache: true});
  await waitFor(`document.readyState === 'complete' && globalThis.__ROMANTIC16_TEST__ && document.body.dataset.view === 'result'`);
  assert.equal((await current()).resultStatus, status);
  const expectedCards = {focused: 1, dual: 2, distributed: 3}[status];
  assert.equal(await evaluate(`document.querySelectorAll('.profile-card').length`), expectedCards, `${status} result must render ${expectedCards} profile card(s)`);
  for (const width of [320, 390, 430, 1440]) {
    await command('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 621});
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `${status} must fit ${width}px`);
  }
  await command('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await verifyPoster(status);
}

assert.deepEqual(consoleErrors, [], `browser errors: ${consoleErrors.join('; ')}`);
console.log(`PASS browser flow (${resultStatus}), back/edit, refresh persistence, responsive layouts, portraits, and all four result states`);
socket.close();
await fetch(`http://127.0.0.1:${debugPort}/json/close/${target.id}`);
