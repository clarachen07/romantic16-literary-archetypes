const bank = require('./bank');
const {nextQuestion, analyze, validate} = require('./engine');
const {profiles, traitCopy, resultStatus} = require('./profiles');
const STORAGE_KEY = 'romantic16:mini:session:v1';
let memory = null;
const clone = value => JSON.parse(JSON.stringify(value));
function fresh(started = false, seed = `${Date.now()}-${Math.random().toString(36).slice(2)}`) {
  return {version: bank.version, seed, started, anchors: {}, core: {}, adaptive: [], history: [], draft: null};
}
function read(api) {
  let saved = memory;
  if (!saved) { try { saved = api.getStorageSync(STORAGE_KEY); } catch {} }
  const record = value => value && typeof value === 'object' && !Array.isArray(value);
  if (saved && saved.version === bank.version && typeof saved.seed === 'string' && saved.seed.length && typeof saved.started === 'boolean' && record(saved.anchors) && record(saved.core) && Array.isArray(saved.adaptive) && Array.isArray(saved.history)) {
    try { validate(bank, saved); memory = clone(saved); return clone(saved); } catch {}
  }
  return fresh();
}
function save(api, state) {
  memory = clone(state);
  try { api.setStorageSync(STORAGE_KEY, memory); return true; } catch { return false; }
}
function clear(api) { memory = fresh(); try { api.removeStorageSync(STORAGE_KEY); } catch {} }
function current(state) { return state.started ? nextQuestion(bank, state, state.seed) : null; }
function answer(state, value) {
  const question = current(state);
  if (!question) throw new Error('没有待回答题目');
  if (question.kind === 'anchor') {
    if (!Number.isInteger(value) || value < 1 || value > 5) throw new Error('请选择有效选项');
    state.anchors[question.id] = value;
  } else if (question.kind === 'core') {
    const option = question.options[value];
    if (!option) throw new Error('请选择有效选项');
    if (!state.draft || state.draft.id !== question.id) {
      state.draft = {id: question.id, best: option.type};
      return false;
    }
    if (state.draft.best === option.type) return false;
    state.core[question.id] = {best: state.draft.best, worst: option.type};
    state.adaptive = [];
  } else {
    if (!['a', 'b', 'equal'].includes(value)) throw new Error('请选择有效选项');
    state.adaptive.push({a: question.a, b: question.b, format: question.format, source: question.source, answer: value});
  }
  state.history.push({kind: question.kind, id: question.id});
  state.draft = null;
  return true;
}
function back(state) {
  if (state.draft) { state.draft = null; return; }
  const previous = state.history.pop();
  if (!previous) { state.started = false; return; }
  if (previous.kind === 'anchor') delete state.anchors[previous.id];
  if (previous.kind === 'core') {
    delete state.core[previous.id];
    state.adaptive = [];
    state.history = state.history.filter(item => item.kind !== 'adaptive');
  }
  if (previous.kind === 'adaptive') state.adaptive.pop();
}
function publicQuestion(state) {
  const q = current(state);
  if (!q) return null;
  const stage = q.kind === 'anchor' ? 0 : q.kind === 'core' ? 1 : 2;
  const done = [Object.keys(state.anchors).length, Object.keys(state.core).length, state.adaptive.length];
  const total = [15, 8, 4][stage];
  const draft = state.draft && state.draft.id === q.id ? state.draft : null;
  return {
    id: q.id, kind: q.kind,
    act: ['第一幕 · 人格风格', '第二幕 · 情境取舍', '第三幕 · 动机追问'][stage],
    sequence: done.reduce((a,b) => a+b,0) + 1,
    count: `${done[stage] + 1} / ${stage === 2 ? '最多 ' : ''}${total}`,
    progress: Math.round((done[stage] + 1) / total * 100),
    kicker: q.kind === 'anchor' ? '这句话有多像最近半年的你？' : q.kind === 'core' ? q.context : '相近动机复核',
    title: q.kind === 'anchor' ? q.text : q.stem,
    selectingWorst: Boolean(draft),
    options: q.kind === 'anchor' ? q.responseLabels.map((text,i) => ({id: i+1, letter: String(i+1), text}))
      : q.kind === 'core' ? q.options.map((item,i) => ({id: i, letter: String.fromCharCode(65+i), text: item.text, selected: Boolean(draft && draft.best === item.type)}))
      : q.options.filter(item => item.key !== 'neither').map((item,i) => ({id:item.key, letter:i<2?String.fromCharCode(65+i):'', text:item.text}))
  };
}
function portrait(code) { return `/assets/portraits/${code.toLowerCase()}.jpg`; }
function report(state) {
  const analysis = analyze(bank, state, state.seed);
  const codes = analysis.status === 'focused' ? [analysis.primary] : analysis.status === 'dual' ? analysis.candidates.slice(0,2) : analysis.status === 'distributed' ? analysis.candidates.slice(0,3) : [];
  const selected = codes.map(code => ({...profiles[code], image:portrait(code)}));
  const traits = Object.entries(analysis.traits).filter(([,item]) => item.usable).sort((a,b) => Math.abs(b[1].mean-3)-Math.abs(a[1].mean-3));
  let expression = '连续人格题的有效回答不足，暂不推断你的表达方式。';
  if (traits.length) { const [dimension,item] = traits[0]; expression = traitCopy[dimension][item.mean>=11/3?'high':item.mean<=7/3?'low':'mid']; }
  const evidence = [];
  for (const code of codes) {
    for (const item of analysis.evidence[code] || []) {
      if (item.kind === 'core') { const scene = bank.core_scenes.find(q => q.id === item.source); evidence.push(`在“${scene.context}”中，你优先选择了“${item.text}”`); }
    }
  }
  const runner = analysis.ranking.find(item => !codes.includes(item.type));
  const comparison = analysis.status === 'focused' && runner ? `你本次更常保护“${selected[0].motive}”；相邻的${profiles[runner.type].name}更看重“${profiles[runner.type].motive}”。`
    : analysis.status === 'dual' ? `你同时在“${selected[0].motive}”与“${selected[1].motive}”之间保留了位置。`
    : '你的选择分布在不同动机之间，场景变化比单一标签更能解释这次答卷。';
  return {status:analysis.status, label:resultStatus[analysis.status].label, intro:resultStatus[analysis.status].intro,
    title:analysis.status==='focused'?selected[0].name:resultStatus[analysis.status].label, code:analysis.status==='focused'?selected[0].code:'',
    profiles:selected, expression, evidence:[...new Set(evidence)].slice(0,3), comparison, costs:selected.map(p=>p.blindSpot), nValidCore:analysis.nValidCore};
}
module.exports = {STORAGE_KEY, fresh, read, save, clear, current, answer, back, publicQuestion, report};
