import { nextQuestion, analyze } from './engine.mjs';
import { profiles, traitCopy, resultStatus } from './profiles.mjs';

const STORAGE_KEY = 'romantic16:v0.1:session';
const app = document.querySelector('#app');
const live = document.querySelector('#announcer');
let bank;
let state;
let renderedQuestionId = null;

document.addEventListener('pointermove', (event) => {
  if ((event.pointerType === 'mouse' || event.pointerType === 'pen') && (event.movementX || event.movementY)) {
    document.body.dataset.hoverReady = 'true';
  }
});

const escapeHTML = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

function freshState(started = false) {
  return {
    version: bank?.version ?? 'romantic16-v0.1-unvalidated',
    seed: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    started,
    anchors: {},
    core: {},
    adaptive: [],
    history: [],
    snapshots: {},
    draft: null
  };
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState(false);
    const parsed = JSON.parse(raw);
    if (parsed.version !== bank.version || typeof parsed.seed !== 'string') return freshState(false);
    return {
      ...freshState(false),
      ...parsed,
      anchors: parsed.anchors ?? {},
      core: parsed.core ?? {},
      adaptive: Array.isArray(parsed.adaptive) ? parsed.adaptive : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      snapshots: parsed.snapshots ?? {}
    };
  } catch {
    return freshState(false);
  }
}

function saveState() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The questionnaire remains usable even when storage is blocked.
  }
}

function announce(message) {
  live.textContent = '';
  requestAnimationFrame(() => { live.textContent = message; });
}

function currentQuestion() {
  if (!state.started) return null;
  return nextQuestion(bank, state, state.seed);
}

function answeredCount() {
  return Object.keys(state.anchors).length + Object.keys(state.core).length + state.adaptive.length;
}

function progressFor(question) {
  if (question.kind === 'anchor') {
    const index = bank.anchors.findIndex((item) => item.id === question.id) + 1;
    return {act: '第一幕 · 人格风格', count: `${index} / 15`, number: answeredCount() + 1};
  }
  if (question.kind === 'core') {
    const index = bank.core_order.indexOf(question.id) + 1;
    return {act: '第二幕 · 情境取舍', count: `${index} / 8`, number: answeredCount() + 1};
  }
  return {act: '第三幕 · 动机追问', count: `${state.adaptive.length + 1} / 最多 4`, number: answeredCount() + 1};
}

function publicQuestionId() {
  return `question-${answeredCount() + 1}`;
}

function renderShell(content, {wide = false, footer = true} = {}) {
  app.innerHTML = `
    <section class="page-panel ${wide ? 'page-panel--wide' : ''}">
      ${content}
    </section>
    ${footer ? '<p class="privacy-note">答案仅保存在当前标签页，不会上传。</p>' : ''}
  `;
}

function renderIntro() {
  renderShell(`
    <div class="intro-grid">
      <div class="intro-copy">
        <p class="eyebrow">十六种文学原型 · 一次自我探索</p>
        <h1 aria-label="ROMANTIC16"><span class="wordmark">Romantic</span><span class="wordmark-number">16</span></h1>
        <p class="lede">当自由、爱情、秩序与欲望不能兼得时，你会替谁辩护？</p>
        <p class="intro-guidance">请回答真实的你，而不是理想中的你。<br>参考最近半年大多数时候的自己。</p>
        <div class="intro-actions">
          <button class="primary-button" id="start-button">翻开我的故事 <span aria-hidden="true">↗</span></button>
          <span class="time-note">25—27题 · 约3—5分钟</span>
        </div>
      </div>
      <figure class="intro-art">
        <picture>
          <source type="image/webp" srcset="./assets/portraits/free-480.webp 480w, ./assets/portraits/free-960.webp 960w" sizes="(max-width: 620px) 100vw, 420px">
          <img src="./assets/portraits/free.jpg" width="1120" height="1400" alt="原创浪漫主义意象：印第安娜在帷幕与远方之间凝望" fetchpriority="high" decoding="async">
        </picture>
        <figcaption><span lang="fr">L’âme romantique</span><small>在故事里，遇见自己</small></figcaption>
      </figure>
    </div>
    <aside class="intro-notes" aria-label="问卷说明">
      <div><h2>双层画像</h2><p>文学原型描述动机，连续特质描述表达方式。</p></div>
      <div><h2>允许不确定</h2><p>结果可能呈现单一、双原型或分散倾向。</p></div>
      <div><h2>不作诊断</h2><p>用于自我理解，不评价人格高低。适合18岁以上读者。</p></div>
    </aside>
  `);
  document.querySelector('#start-button').addEventListener('click', () => {
    state = freshState(true);
    saveState();
    render();
    announce('问卷开始，第一幕：人格风格。');
  });
}

function renderProgress(question) {
  const progress = progressFor(question);
  const phaseIndex = question.kind === 'anchor' ? 0 : question.kind === 'core' ? 1 : 2;
  const phaseTotal = [15, 8, 4][phaseIndex];
  const phaseDone = question.kind === 'anchor' ? Object.keys(state.anchors).length : question.kind === 'core' ? Object.keys(state.core).length : state.adaptive.length;
  return `
    <header class="question-header">
      <div>
        <p class="eyebrow">${escapeHTML(progress.act)}</p>
        <p class="question-sequence">第 ${progress.number} 题</p>
      </div>
      <p class="phase-count">${escapeHTML(progress.count)}</p>
    </header>
    <div class="phase-rule" aria-hidden="true"><span style="width: ${Math.round((phaseDone + 1) / phaseTotal * 100)}%"></span></div>
  `;
}

function renderAnchor(question) {
  const labels = question.responseLabels;
  renderShell(`
    ${renderProgress(question)}
    <div class="question-body">
      <p class="question-kicker">这句话有多像最近半年的你？</p>
      <h2>${escapeHTML(question.text)}</h2>
      <div class="likert" role="group" aria-label="选择符合程度">
        ${labels.map((label, index) => `
          <button class="likert-option" data-choice="${index + 1}">
            <span class="likert-number" aria-hidden="true">${index + 1}</span>
            <span>${escapeHTML(label)}</span>
          </button>
        `).join('')}
      </div>
      <div class="question-actions">
        <button class="text-button back-button">← 返回</button>
      </div>
    </div>
  `);
  document.querySelectorAll('.likert-option').forEach((button) => {
    button.addEventListener('click', () => submitAnchor(question, Number(button.dataset.choice)));
  });
  document.querySelector('.back-button').addEventListener('click', goBack);
}

function renderCore(question) {
  const draft = state.draft?.id === question.id ? state.draft : null;
  const bestIndex = draft ? question.options.findIndex((option) => option.type === draft.best) : -1;
  renderShell(`
    ${renderProgress(question)}
    <div class="question-body">
      <p class="question-kicker">${escapeHTML(question.context)}</p>
      <h2>${escapeHTML(question.stem)}</h2>
      <div class="choice-instruction">
        <span class="step-chip ${draft ? 'step-chip--done' : 'step-chip--active'}">1 · 最像</span>
        <span class="step-line" aria-hidden="true"></span>
        <span class="step-chip ${draft ? 'step-chip--active' : ''}">2 · 最不像</span>
      </div>
      <p class="selection-prompt">${draft ? '现在，从剩下三项中选择最不像你的做法。' : '先选择最像你通常做法的一项。'}</p>
      <div class="scene-options" role="group" aria-label="情境选项">
        ${question.options.map((option, index) => `
          <button class="scene-option ${index === bestIndex ? 'scene-option--best' : ''}" data-choice="${index}" ${index === bestIndex ? 'aria-pressed="true"' : ''}>
            <span class="choice-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
            <span class="choice-text">${escapeHTML(option.text)}</span>
            ${index === bestIndex ? '<span class="choice-badge">最像</span>' : ''}
          </button>
        `).join('')}
      </div>
      ${draft ? '<button class="text-button revise-best" type="button">重新选择“最像”</button>' : ''}
      <div class="question-actions">
        <button class="text-button back-button">← 返回</button>
      </div>
    </div>
  `);
  document.querySelectorAll('.scene-option').forEach((button) => {
    button.addEventListener('click', () => handleCoreChoice(question, Number(button.dataset.choice)));
  });
  document.querySelector('.revise-best')?.addEventListener('click', () => {
    state.draft = null;
    saveState();
    render();
    announce('已清除“最像”选择，请重新选择。');
  });
  document.querySelector('.back-button').addEventListener('click', goBack);
}

function renderAdaptive(question) {
  renderShell(`
    ${renderProgress(question)}
    <div class="question-body">
      <p class="question-kicker">相近动机复核</p>
      <h2>${escapeHTML(question.stem)}</h2>
      <p class="selection-prompt">请选择更接近你通常反应的一项。</p>
      <div class="pair-options" role="group" aria-label="动机比较选项">
        ${question.options.filter((option) => option.key !== 'neither').map((option, index) => `
          <button class="pair-option pair-option--${escapeHTML(option.key)}" data-choice="${escapeHTML(option.key)}">
            ${index < 2 ? `<span class="choice-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>` : ''}
            <span>${escapeHTML(option.text)}</span>
          </button>
        `).join('')}
      </div>
      <div class="question-actions">
        <button class="text-button back-button">← 返回</button>
        <span class="route-note">追问会根据前面的选择变化</span>
      </div>
    </div>
  `);
  document.querySelectorAll('.pair-option').forEach((button) => {
    button.addEventListener('click', () => submitAdaptive(question, button.dataset.choice));
  });
  document.querySelector('.back-button').addEventListener('click', goBack);
}

function snapshotQuestion(question, response) {
  if (question.kind === 'anchor') {
    state.snapshots[question.id] = {kind: 'anchor', text: question.text, response};
  } else if (question.kind === 'core') {
    state.snapshots[question.id] = {
      kind: 'core', context: question.context, stem: question.stem,
      options: question.options.map((option, index) => ({publicId: `choice-${index + 1}`, text: option.text})),
      response
    };
  } else {
    const selected = question.options.find((option) => option.key === response);
    state.snapshots[question.id] = {
      kind: 'adaptive', stem: question.stem,
      options: question.options.map((option) => ({key: option.key, text: option.text})),
      response, chosenText: ['a', 'b'].includes(response) ? selected?.text : null
    };
  }
}

function complete(question, message) {
  state.history.push({kind: question.kind, id: question.id});
  state.draft = null;
  saveState();
  render();
  announce(message);
}

function submitAnchor(question, value) {
  state.anchors[question.id] = value;
  snapshotQuestion(question, value);
  complete(question, value === null ? '已跳过这道题。' : '已记录选择。');
}

function handleCoreChoice(question, index) {
  const option = question.options[index];
  const draft = state.draft?.id === question.id ? state.draft : null;
  if (!draft) {
    state.draft = {id: question.id, best: option.type};
    saveState();
    render();
    announce('已选出最像你的做法。现在请选择最不像的一项。');
    return;
  }
  if (draft.best === option.type) return;
  submitCore(question, {best: draft.best, worst: option.type});
}

function submitCore(question, response) {
  state.core[question.id] = response;
  const publicResponse = response === null ? null : {
    best: `choice-${question.options.findIndex((option) => option.type === response.best) + 1}`,
    worst: `choice-${question.options.findIndex((option) => option.type === response.worst) + 1}`
  };
  snapshotQuestion(question, publicResponse);
  complete(question, response === null ? '已跳过整个情境。' : '已记录最像与最不像的选择。');
}

function submitAdaptive(question, answer) {
  state.adaptive.push({a: question.a, b: question.b, format: question.format, source: question.source, answer});
  snapshotQuestion(question, answer);
  complete(question, answer === 'neither' ? '已记录为都不符合。' : '已记录追问选择。');
}

function goBack() {
  if (state.draft) {
    state.draft = null;
    saveState();
    render();
    announce('已返回这道题的第一步。');
    return;
  }
  const previous = state.history.pop();
  if (!previous) {
    state.started = false;
    saveState();
    render();
    announce('已返回问卷说明。');
    return;
  }
  if (previous.kind === 'anchor') delete state.anchors[previous.id];
  if (previous.kind === 'core') {
    delete state.core[previous.id];
    state.adaptive = [];
    state.history = state.history.filter((item) => item.kind !== 'adaptive');
    Object.keys(state.snapshots).filter((key) => /^A\d+$/.test(key)).forEach((key) => delete state.snapshots[key]);
  }
  if (previous.kind === 'adaptive') state.adaptive.pop();
  delete state.snapshots[previous.id];
  saveState();
  render();
  announce('已返回上一题，可以修改答案。');
}

function strongestTrait(analysis) {
  const usable = Object.entries(analysis.traits).filter(([, item]) => item.usable);
  if (!usable.length) return '连续人格题的有效回答不足，暂不推断你的表达方式。';
  usable.sort((a, b) => Math.abs(b[1].mean - 3) - Math.abs(a[1].mean - 3));
  const [dimension, item] = usable[0];
  const band = item.mean >= 11 / 3 ? 'high' : item.mean <= 7 / 3 ? 'low' : 'mid';
  return traitCopy[dimension][band];
}

function evidenceItems(analysis, codes) {
  const items = [];
  for (const code of codes) {
    for (const evidence of analysis.evidence[code] ?? []) {
      if (items.length >= 3) break;
      if (evidence.kind === 'core') {
        const scene = bank.core_scenes.find((item) => item.id === evidence.source);
        items.push(`在“${scene?.context ?? '情境选择'}”中，你优先选择了“${evidence.text}”`);
      } else {
        const snapshot = state.snapshots[evidence.source];
        if (snapshot?.chosenText) items.push(`在相近动机的复核中，你更接近“${snapshot.chosenText}”`);
      }
    }
    if (items.length >= 3) break;
  }
  return [...new Set(items)].slice(0, 3);
}

function profileCard(profile, compact = false) {
  const portraitBase = profile.image.replace(/\.jpg$/, '');
  return `
    <article class="profile-card ${compact ? 'profile-card--compact' : ''}">
      <figure class="portrait-frame">
        <picture>
          <source type="image/webp" srcset="${escapeHTML(portraitBase)}-480.webp 480w, ${escapeHTML(portraitBase)}-960.webp 960w" sizes="(max-width: 620px) calc(100vw - 64px), 440px">
          <img src="${escapeHTML(profile.image)}" width="1120" height="1400" alt="${escapeHTML(profile.alt)}" loading="lazy" decoding="async">
        </picture>
        <figcaption>原创意象插画 · 非原著插图</figcaption>
      </figure>
      <div class="profile-copy">
        <p class="profile-code">${escapeHTML(profile.code)}</p>
        <h3>${escapeHTML(profile.name)}</h3>
        <p class="profile-figure">${escapeHTML(profile.figure)} · ${escapeHTML(profile.work)}</p>
        <blockquote>“${escapeHTML(profile.quote)}”</blockquote>
        ${compact ? `<p>${escapeHTML(profile.essence)}</p>` : `
          <p class="profile-essence">${escapeHTML(profile.essence)}</p>
          <details class="story-fold" open>
            <summary>人物情节</summary>
            <p>${escapeHTML(profile.story)}</p>
          </details>
        `}
      </div>
    </article>
  `;
}

function renderResult() {
  const analysis = analyze(bank, state, state.seed);
  const status = resultStatus[analysis.status];
  const codes = analysis.status === 'focused'
    ? [analysis.primary]
    : analysis.status === 'dual'
      ? analysis.candidates.slice(0, 2)
      : analysis.status === 'distributed'
        ? analysis.candidates.slice(0, 3)
        : [];
  const selectedProfiles = codes.map((code) => profiles[code]).filter(Boolean);
  const evidence = evidenceItems(analysis, codes);
  const runner = analysis.ranking.find((item) => !codes.includes(item.type));
  const lead = selectedProfiles[0];
  const comparison = analysis.status === 'focused' && runner && lead
    ? `你本次更常保护“${lead.motive}”；相邻的 ${profiles[runner.type].code}｜${profiles[runner.type].name} 更看重“${profiles[runner.type].motive}”。`
    : analysis.status === 'dual' && selectedProfiles.length === 2
      ? `你同时在“${selectedProfiles[0].motive}”与“${selectedProfiles[1].motive}”之间保留了位置。`
      : '你的选择分布在不同动机之间，场景变化比单一标签更能解释这次答卷。';
  const cost = selectedProfiles.length
    ? selectedProfiles.map((profile) => profile.blindSpot).join('；')
    : null;

  if (analysis.status === 'insufficient') {
    renderShell(`
      <div class="result-heading">
        <p class="eyebrow">你的文学人格画像</p>
        <p class="result-index">R · XVI</p>
        <h1>${escapeHTML(status.label)}</h1>
        <p>${escapeHTML(status.intro)}</p>
      </div>
      <section class="insufficient-card">
        <span class="empty-seal" aria-hidden="true">?</span>
        <h2>这一次，不急着替你定型</h2>
        <p>你完成了 ${analysis.nValidCore} / 8 个有效情境，并作出 ${analysis.nDecisiveAdaptive} 次明确追问选择。可以返回补充，也可以保留这份不确定。</p>
      </section>
      ${resultActions()}
    `, {wide: true});
    bindResultActions({status: analysis.status, profiles: selectedProfiles});
    return;
  }

  renderShell(`
    <div class="result-heading">
      <p class="eyebrow">你的文学人格画像</p>
      <p class="result-index">R · XVI</p>
      <h1>${analysis.status === 'focused' ? `<span class="result-code">${escapeHTML(lead.code)}</span>${escapeHTML(lead.name)}` : escapeHTML(status.label)}</h1>
      <p><strong>${escapeHTML(status.label)}。</strong>${escapeHTML(status.intro)}</p>
    </div>
    <div class="profiles-grid profiles-grid--${selectedProfiles.length}">
      ${selectedProfiles.map((profile) => profileCard(profile, analysis.status === 'distributed')).join('')}
    </div>
    <div class="result-report">
      <section class="report-section report-section--evidence">
        <p class="section-number">I</p>
        <div><h2>这份判断从哪里来</h2>
          ${evidence.length ? `<ul>${evidence.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : '<p>你的有效选择分散在不同候选上，没有足够集中的单项依据。</p>'}
        </div>
      </section>
      <section class="report-section">
        <p class="section-number">II</p>
        <div><h2>你表达这种动机的方式</h2><p>${escapeHTML(strongestTrait(analysis))}</p></div>
      </section>
      <section class="report-section">
        <p class="section-number">III</p>
        <div><h2>${analysis.status === 'dual' ? '两种动机如何共存' : '与相邻原型的区别'}</h2><p>${escapeHTML(comparison)}</p></div>
      </section>
      ${cost ? `<section class="report-section report-section--cost"><p class="section-number">IV</p><div><h2>可能的代价</h2><p>${escapeHTML(cost)}</p><small>这是反思提示，不是对你一定如此的断言。</small></div></section>` : ''}
    </div>
    <p class="result-disclaimer">这是未校准的文学原型探索结果，不是诊断、概率或对人格高低的评价。</p>
    ${resultActions()}
  `, {wide: true});
  bindResultActions({status: analysis.status, profiles: selectedProfiles});
}

function resultActions() {
  return `
    <div class="result-actions">
      <button class="secondary-button" id="edit-result">← 返回修改</button>
      <button class="primary-button" id="share-result">分享人格画像</button>
      <button class="secondary-button" id="restart">重新翻开问卷</button>
    </div>
    <p class="share-entry-note">生成专属海报，邀请朋友扫码探索自己的文学原型。</p>
  `;
}

function bindResultActions(posterResult) {
  const shareButton = document.querySelector('#share-result');
  shareButton.addEventListener('click', async () => {
    shareButton.disabled = true;
    shareButton.textContent = '正在准备海报…';
    try {
      const {openSharePoster} = await import('./share.mjs');
      openSharePoster(posterResult, shareButton);
    } catch {
      announce('分享功能暂时未能载入，请检查网络后再试。');
      document.querySelector('.share-entry-note').textContent = '分享功能暂时未能载入，请检查网络后再次点击。';
    } finally {
      shareButton.disabled = false;
      shareButton.textContent = '分享人格画像';
    }
  });
  document.querySelector('#edit-result').addEventListener('click', goBack);
  document.querySelector('#restart').addEventListener('click', () => {
    state = freshState(true);
    saveState();
    render();
    announce('已开始一份新的问卷。');
  });
}

function render() {
  // A stationary pointer must not make the next question look preselected.
  document.body.dataset.hoverReady = 'false';
  document.body.dataset.view = state.started ? 'questionnaire' : 'intro';
  if (!state.started) {
    renderedQuestionId = null;
    return renderIntro();
  }
  let question;
  try {
    question = currentQuestion();
  } catch (error) {
    renderError('问卷状态无法继续读取。请重新开始。', error);
    return;
  }
  if (!question) {
    document.body.dataset.view = 'result';
    renderResult();
    if (renderedQuestionId !== 'result') resetReadingPosition('result');
    return;
  }
  if (question.kind === 'anchor') renderAnchor(question);
  if (question.kind === 'core') renderCore(question);
  if (question.kind === 'adaptive') renderAdaptive(question);
  if (renderedQuestionId !== question.id) resetReadingPosition(question.id);
}

function resetReadingPosition(questionId) {
  renderedQuestionId = questionId;
  const heading = document.querySelector('.question-body h2, .result-heading h1');
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({preventScroll: true});
  }
  window.scrollTo({top: 0, behavior: 'instant'});
}

function renderError(message, error) {
  console.error(error);
  renderShell(`
    <div class="error-card">
      <p class="eyebrow">无法继续</p>
      <h1>${escapeHTML(message)}</h1>
      <p>${bank ? '可以重新开始一份问卷。' : '请检查网络连接，然后重试。'}</p>
      <button class="primary-button" id="recover">${bank ? '重新开始' : '重新加载'}</button>
    </div>
  `);
  document.querySelector('#recover').addEventListener('click', () => {
    if (!bank) {
      renderShell('<div class="loading-card" role="status"><span class="loading-mark" aria-hidden="true">R</span><p>正在打开问卷…</p></div>');
      void init();
      return;
    }
    state = freshState(false);
    saveState();
    render();
  });
}

function readCurrentQuestion() {
  if (!state.started) return {status: 'not_started'};
  const question = currentQuestion();
  if (!question) {
    const result = analyze(bank, state, state.seed);
    const visibleTypes = result.status === 'focused' ? [result.primary] : result.candidates;
    return {status: 'result', resultStatus: result.status, visibleTypes};
  }
  const progress = progressFor(question);
  const base = {status: 'question', questionId: publicQuestionId(), kind: question.kind, text: question.text ?? question.stem, progress};
  if (question.kind === 'anchor') return {...base, options: question.responseLabels.map((text, index) => ({id: String(index + 1), text}))};
  if (question.kind === 'core') return {...base, options: question.options.map((option, index) => ({id: `choice-${index + 1}`, text: option.text})), instruction: bank.instructions.scene_response};
  return {...base, options: question.options.filter((option) => option.key !== 'neither').map((option) => ({id: option.key, text: option.text}))};
}

function answerCurrentQuestion(input) {
  if (!input || input.questionId !== publicQuestionId()) throw new Error('questionId does not match the current question');
  const question = currentQuestion();
  if (!question) throw new Error('The questionnaire is already complete');
  const response = input.response;
  if (question.kind === 'anchor') {
    const value = response?.value;
    if (!Number.isInteger(value) || value < 1 || value > 5) throw new Error('Anchor response must be 1–5');
    submitAnchor(question, value);
  } else if (question.kind === 'core') {
    const bestIndex = Number(String(response?.best ?? '').replace('choice-', '')) - 1;
    const worstIndex = Number(String(response?.worst ?? '').replace('choice-', '')) - 1;
    if (!question.options[bestIndex] || !question.options[worstIndex] || bestIndex === worstIndex) throw new Error('Choose two distinct valid core options');
    submitCore(question, {best: question.options[bestIndex].type, worst: question.options[worstIndex].type});
  } else {
    const value = response?.value;
    if (!['a', 'b', 'equal'].includes(value)) throw new Error('Adaptive response is invalid');
    submitAdaptive(question, value);
  }
  return readCurrentQuestion();
}

function registerWebMCP() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const tools = [
    {
      name: 'read_current_question', title: '读取当前问卷题目',
      description: '读取ROMANTIC16当前可见题目、公开选项和进度；不会返回隐藏类型、维度或分数。',
      inputSchema: {type: 'object', properties: {}, additionalProperties: false},
      annotations: {readOnlyHint: true, untrustedContentHint: false},
      execute: () => readCurrentQuestion()
    },
    {
      name: 'answer_current_question', title: '回答当前问卷题目',
      description: '使用read_current_question返回的questionId与公开选项提交当前答案，并更新页面。短陈述使用response.value 1–5；情境题使用response.best和response.worst；追问使用response.value。',
      inputSchema: {
        type: 'object', required: ['questionId', 'response'], additionalProperties: false,
        properties: {questionId: {type: 'string'}, response: {type: 'object'}}
      },
      annotations: {readOnlyHint: false, untrustedContentHint: false},
      execute: (input) => answerCurrentQuestion(input)
    }
  ];
  for (const tool of tools) {
    try {
      void Promise.resolve(context.registerTool(tool, {signal: lifecycle.signal})).catch((error) => console.warn('WebMCP registration failed', error));
    } catch (error) {
      console.warn('WebMCP registration failed', error);
    }
  }
  addEventListener('pagehide', () => lifecycle.abort(), {once: true});
}

async function init() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('./question_bank.json', {signal: controller.signal});
    if (!response.ok) throw new Error(`Question bank could not load: ${response.status}`);
    bank = await response.json();
    state = loadState();
    render();
    registerWebMCP();
    if (['localhost', '127.0.0.1'].includes(location.hostname)) {
      globalThis.__ROMANTIC16_TEST__ = {readCurrentQuestion, answerCurrentQuestion, getState: () => structuredClone(state)};
    }
  } catch (error) {
    renderError('问卷资料没有正确载入。', error);
  } finally {
    clearTimeout(timeout);
  }
}

init();
