import {resultStatus} from './profiles.mjs';

// The QR always invites a new questionnaire. It never encodes personal answers.
export const QUESTIONNAIRE_URL = 'https://romantic16.netlify.app/';
const W = 1080;
const H = 1800;
const palette = {ink: '#422c36', rose: '#813d59', muted: '#77626b', gold: '#96764f'};

function loadImage(src, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => finish(new Error('Image loading timed out')), 15000);
    const aborted = () => finish(new DOMException('Closed', 'AbortError'));
    function finish(error) {
      clearTimeout(timer);
      signal?.removeEventListener('abort', aborted);
      image.onload = image.onerror = null;
      error ? reject(error) : resolve(image);
    }
    image.onload = () => finish();
    image.onerror = () => finish(new Error('Poster image unavailable'));
    signal?.addEventListener('abort', aborted, {once: true});
    if (signal?.aborted) return aborted();
    image.src = new URL(src, import.meta.url).href;
  });
}

async function loadPortrait(profile, signal) {
  try { return await loadImage(profile.image.replace(/\.jpg$/, '-960.webp'), signal); }
  catch (error) {
    if (error.name === 'AbortError') throw error;
    return loadImage(profile.image, signal);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function cover(ctx, image, x, y, w, h, arch = false) {
  ctx.save();
  if (arch) {
    const radius = w / 2;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  } else roundRect(ctx, x, y, w, h, 12);
  ctx.clip();
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const dw = image.naturalWidth * scale;
  const dh = image.naturalHeight * scale;
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) * .26, dw, dh);
  ctx.restore();
}

function lines(ctx, text, width) {
  const result = [];
  let line = '';
  for (const char of text) {
    if (char === '\n') { result.push(line); line = ''; continue; }
    // Keep closing punctuation on the preceding line where possible.
    if (line && ctx.measureText(line + char).width > width && !/[，。！？；：、”’）》]/.test(char)) {
      result.push(line); line = char;
    } else line += char;
  }
  if (line) result.push(line);
  return result;
}

function textBlock(ctx, text, x, y, width, {size = 28, lineHeight = 44, family = 'serif', color = palette.ink, align = 'left', maxLines = 4, minSize = 22} = {}) {
  let wrapped;
  do {
    ctx.font = `500 ${size}px ${family}`;
    wrapped = lines(ctx, text, width);
    if (wrapped.length <= maxLines || size <= minSize) break;
    size -= 1;
  } while (true);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  for (const [index, line] of wrapped.entries()) ctx.fillText(line, x, y + index * lineHeight);
  return y + wrapped.length * lineHeight;
}

async function posterFonts() {
  const fallback = {serif: '"Songti SC", "STSong", serif', display: 'Georgia, serif', sans: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'};
  if (!document.fonts) return fallback;
  let timeout;
  try {
    const ready = await Promise.race([
      Promise.all([document.fonts.load('500 36px "Romantic Serif"'), document.fonts.load('400 80px Cormorant'), document.fonts.load('italic 400 40px Cormorant')]).then(() => true),
      new Promise(resolve => { timeout = setTimeout(() => resolve(false), 4000); })
    ]);
    return ready ? {...fallback, serif: `"Romantic Serif", ${fallback.serif}`, display: `Cormorant, ${fallback.display}`} : fallback;
  } catch { return fallback; }
  finally { clearTimeout(timeout); }
}

export async function createPoster(result, {signal} = {}) {
  const status = resultStatus[result.status];
  if (!status) throw new Error('Unknown result');
  const count = {focused: 1, dual: 2, distributed: 3, insufficient: 0}[result.status];
  const profiles = result.profiles.slice(0, count);
  if (profiles.length !== count) throw new Error('Incomplete result');
  const decorative = {image: './assets/portraits/free.jpg'};
  const [font, qr, pictures] = await Promise.all([
    posterFonts(),
    loadImage('./assets/questionnaire-qr.png', signal),
    Promise.all((count ? profiles : [decorative]).map(profile => loadPortrait(profile, signal)))
  ]);
  if (signal?.aborted) throw new DOMException('Closed', 'AbortError');
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image rendering unavailable');
  const background = ctx.createLinearGradient(0, 0, W, H);
  background.addColorStop(0, '#fcf5e9');
  background.addColorStop(.52, '#f7edeb');
  background.addColorStop(1, '#eadde5');
  ctx.fillStyle = background; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#b994825e'; ctx.lineWidth = 1.5;
  ctx.strokeRect(32, 32, W - 64, H - 64);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left'; ctx.fillStyle = palette.rose;
  ctx.font = `400 88px ${font.display}`; ctx.fillText('Romantic', 88, 70);
  const brandWidth = ctx.measureText('Romantic').width;
  ctx.font = `italic 400 40px ${font.display}`; ctx.fillText('16', 94 + brandWidth, 72);
  ctx.fillStyle = palette.gold; ctx.font = `500 18px ${font.sans}`; ctx.textAlign = 'right';
  ctx.fillText('PORTRAIT LITTÉRAIRE', W - 88, 120);
  const rule = y => { ctx.strokeStyle = '#b994826b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(88, y); ctx.lineTo(W - 88, y); ctx.stroke(); };
  rule(188);
  textBlock(ctx, '我的文学人格画像', 88, 218, 904, {family: font.sans, size: 24, color: palette.rose});
  const title = count === 1 ? profiles[0].name : count === 2 ? '我的双原型' : count === 3 ? '不止一种可能' : '这次，暂不定型';
  textBlock(ctx, title, 88, 268, 904, {family: font.serif, size: 74, maxLines: 1, color: palette.ink});
  const subtitle = count === 1 ? `${profiles[0].code}  /  ${profiles[0].figure} · ${status.label}` : status.label;
  textBlock(ctx, subtitle, 90, 365, 904, {family: font.sans, size: 25, color: palette.muted, maxLines: 1});

  if (count <= 1) {
    cover(ctx, pictures[0], 88, 422, 904, 692);
    ctx.save();
    const shade = ctx.createLinearGradient(0, 1020, 0, 1114);
    shade.addColorStop(0, '#29182300'); shade.addColorStop(1, '#291823bc');
    ctx.fillStyle = shade; ctx.fillRect(88, 1020, 904, 94);
    textBlock(ctx, count ? '原创意象插画 · 非原著插图' : '原创文学意象 · 不代表人格归类', 112, 1073, 820, {family: font.sans, size: 19, minSize: 19, color: '#fff5ef'});
    ctx.restore();
    const quote = count ? `“${profiles[0].quote}”` : '“保持不确定，比勉强贴上标签更诚实。”';
    const end = textBlock(ctx, quote, W / 2, 1160, 870, {family: font.serif, size: 37, lineHeight: 57, align: 'center', maxLines: 3, color: palette.rose});
    textBlock(ctx, count ? profiles[0].essence : status.intro, W / 2, Math.max(1280, end + 20), 850, {family: font.sans, size: 27, lineHeight: 43, align: 'center', maxLines: 2});
  } else {
    const gap = 24;
    const width = (904 - gap * (count - 1)) / count;
    const height = count === 2 ? 540 : 442;
    profiles.forEach((profile, index) => {
      const x = 88 + index * (width + gap);
      cover(ctx, pictures[index], x, 432, width, height, true);
      const center = x + width / 2;
      textBlock(ctx, profile.name, center, 432 + height + 27, width, {family: font.serif, size: count === 2 ? 43 : 36, align: 'center', maxLines: 1});
      textBlock(ctx, profile.code, center, 432 + height + 87, width, {family: font.display, size: 26, align: 'center', color: palette.gold, maxLines: 1});
      textBlock(ctx, `“${profile.quote}”`, center, 432 + height + 142, width - 14, {family: font.serif, size: count === 2 ? 28 : 26, lineHeight: 43, align: 'center', color: palette.rose, maxLines: count === 2 ? 3 : 4});
    });
    textBlock(ctx, status.intro, W / 2, 1280, 856, {family: font.sans, size: 28, lineHeight: 44, align: 'center', maxLines: 2});
    textBlock(ctx, '原创意象插画 · 非原著插图', W / 2, 1390, 904, {family: font.sans, size: 19, minSize: 19, align: 'center', color: palette.muted});
  }
  rule(1436);
  textBlock(ctx, '你的故事，\n会是哪一种？', 88, 1490, 540, {family: font.serif, size: 44, lineHeight: 66, maxLines: 2});
  textBlock(ctx, '扫码开始 · 25—27题 · 约3—5分钟', 90, 1650, 555, {family: font.sans, size: 24, color: palette.muted, maxLines: 1});
  textBlock(ctx, '文学原型探索，不用于心理诊断', 90, 1705, 550, {family: font.sans, size: 20, minSize: 20, color: palette.muted, maxLines: 1});
  // Integral module scaling plus the four-module quiet zone keeps the QR crisp.
  const modulesWithBorder = qr.naturalWidth / 8;
  const qrSize = modulesWithBorder * Math.floor(280 / modulesWithBorder);
  const qrX = 992 - qrSize;
  const qrY = 1454;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);
  ctx.imageSmoothingEnabled = true;
  textBlock(ctx, '扫码，发现你的文学原型', qrX + qrSize / 2, qrY + qrSize + 12, qrSize + 16, {family: font.sans, size: 18, minSize: 18, align: 'center', color: palette.muted, maxLines: 1});
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image export unavailable')), 'image/png'));
  return {blob, title, filename: `ROMANTIC16-${profiles.map(profile => profile.code).join('-') || '未定型'}-人格画像.png`};
}

export function openSharePoster(result, trigger) {
  if (document.querySelector('.share-dialog')) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'share-dialog';
  dialog.setAttribute('aria-labelledby', 'share-title');
  dialog.innerHTML = `
    <header class="share-header"><div><p class="eyebrow">ROMANTIC16</p><h2 id="share-title">把你的故事，分享出去</h2></div><button type="button" class="share-close" aria-label="关闭海报">×</button></header>
    <div class="share-body"><div class="poster-stage" aria-busy="true"><p class="poster-loading" role="status">正在绘制你的文学画像…</p></div>
      <p class="share-feedback" role="status" aria-live="polite"></p>
      <div class="poster-actions" hidden><button class="primary-button native-share" type="button" hidden>分享图片</button><a class="secondary-button save-poster" download>保存海报</a><button class="text-button copy-questionnaire" type="button">复制问卷链接</button></div>
      <button class="secondary-button retry-poster" type="button" hidden>重新生成</button>
      <p class="poster-help"></p><p class="poster-privacy">海报仅在你的设备上生成。二维码打开问卷，不包含答题记录。</p>
    </div>`;
  document.body.append(dialog);
  document.body.classList.add('share-open');
  let objectURL;
  let controller;
  let file;
  const stage = dialog.querySelector('.poster-stage');
  const feedback = dialog.querySelector('.share-feedback');
  const nativeShare = dialog.querySelector('.native-share');
  const retry = dialog.querySelector('.retry-poster');
  const actions = dialog.querySelector('.poster-actions');
  const save = dialog.querySelector('.save-poster');
  const help = dialog.querySelector('.poster-help');
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
  let closed = false;
  function cleanup() {
    if (closed) return;
    closed = true;
    controller?.abort();
    if (objectURL) URL.revokeObjectURL(objectURL);
    dialog.remove();
    document.body.classList.remove('share-open');
    if (trigger?.isConnected) trigger.focus({preventScroll: true});
  }
  const close = () => { if (typeof dialog.close === 'function') dialog.close(); cleanup(); };
  dialog.querySelector('.share-close').addEventListener('click', close);
  dialog.addEventListener('close', cleanup);
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close(); } });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href]')].filter(el => el.getClientRects().length);
    const first = focusable[0]; const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else { dialog.setAttribute('open', ''); dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); }
  dialog.querySelector('.share-close').focus();

  async function generate() {
    controller?.abort(); controller = new AbortController();
    stage.innerHTML = '<p class="poster-loading" role="status">正在绘制你的文学画像…</p>';
    stage.setAttribute('aria-busy', 'true');
    actions.hidden = true; retry.hidden = true; feedback.textContent = ''; help.textContent = '';
    try {
      const poster = await createPoster(result, {signal: controller.signal});
      if (closed) return;
      if (objectURL) URL.revokeObjectURL(objectURL);
      objectURL = URL.createObjectURL(poster.blob);
      file = new File([poster.blob], poster.filename, {type: 'image/png'});
      const image = new Image();
      image.className = 'poster-preview'; image.alt = `${poster.title}：我的文学人格画像海报，底部附问卷二维码`;
      image.width = W; image.height = H; image.src = objectURL;
      stage.replaceChildren(image);
      save.href = objectURL; save.download = poster.filename;
      let canShareFile = false;
      try { canShareFile = Boolean(navigator.share && navigator.canShare?.({files: [file]})); } catch {}
      nativeShare.hidden = !canShareFile;
      actions.hidden = false;
      help.textContent = isWeChat ? '在微信内，可长按海报保存图片，再发送给好友或朋友圈。' : canShareFile ? '点击“分享图片”打开系统分享面板；若其中有微信，可直接选择。也可以保存海报后发送。' : '保存海报后，可从微信相册发送给好友或朋友圈。手机上也可长按海报保存。';
    } catch (error) {
      if (closed || error.name === 'AbortError') return;
      stage.textContent = '海报暂时没有生成成功。请检查网络连接后重试。';
      retry.hidden = false;
    } finally { stage.setAttribute('aria-busy', 'false'); }
  }
  retry.addEventListener('click', generate);
  nativeShare.addEventListener('click', async () => {
    if (!file) return;
    nativeShare.disabled = true;
    try {
      // File is already prepared: share() runs directly in this user gesture.
      await navigator.share({files: [file]});
      feedback.textContent = '已交给系统分享面板处理。';
    } catch (error) {
      feedback.textContent = error.name === 'AbortError' ? '已取消分享，海报仍可保存。' : '当前浏览器未能分享图片，请保存海报后发送。';
    } finally { nativeShare.disabled = false; }
  });
  save.addEventListener('click', () => { feedback.textContent = '若未弹出保存窗口，请长按上方海报，选择保存图片。'; });
  dialog.querySelector('.copy-questionnaire').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(QUESTIONNAIRE_URL); feedback.textContent = '已复制问卷链接；朋友打开后可填写自己的问卷。'; }
    catch {
      feedback.replaceChildren(document.createTextNode('请长按或选中复制：'));
      const link = document.createElement('a'); link.href = QUESTIONNAIRE_URL; link.textContent = QUESTIONNAIRE_URL;
      feedback.append(link);
    }
  });
  void generate();
}
