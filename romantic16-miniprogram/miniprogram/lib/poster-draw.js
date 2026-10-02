// Generated from the website poster drawing code; no DOM or network calls.
const {resultStatus} = require('./profiles');
const W = 1080, H = 1800;
const palette = {ink: '#422c36', rose: '#813d59', muted: '#77626b', gold: '#96764f'};
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
  const scale = Math.max(w / (image.naturalWidth || image.width), h / (image.naturalHeight || image.height));
  const dw = (image.naturalWidth || image.width) * scale;
  const dh = (image.naturalHeight || image.height) * scale;
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


function drawPoster(canvas, {status: key, profiles, pictures, qr, font}) {
 const status = resultStatus[key];
 const count = profiles.length;
 if (!status) throw new Error('Unknown result');
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
  const modulesWithBorder = (qr.naturalWidth || qr.width) / 8;
  const qrSize = modulesWithBorder * Math.floor(280 / modulesWithBorder);
  const qrX = 992 - qrSize;
  const qrY = 1454;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);
  ctx.imageSmoothingEnabled = true;
  textBlock(ctx, '扫码，发现你的文学原型', qrX + qrSize / 2, qrY + qrSize + 12, qrSize + 16, {family: font.sans, size: 18, minSize: 18, align: 'center', color: palette.muted, maxLines: 1});

 return canvas;
}
module.exports = {drawPoster, W, H};
