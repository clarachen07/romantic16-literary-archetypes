import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {profiles, resultStatus, traitCopy} from '../dist/profiles.mjs';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(testDir, '..');
const workspaceDir = path.resolve(siteDir, '..');
const distDir = path.join(siteDir, 'dist');
const sourceDir = path.join(workspaceDir, 'questionnaire-engine');
const bank = JSON.parse(fs.readFileSync(path.join(distDir, 'question_bank.json'), 'utf8'));

assert.deepEqual(fs.readFileSync(path.join(distDir, 'engine.mjs')), fs.readFileSync(path.join(sourceDir, 'engine.mjs')), 'deployed engine must remain byte-identical to the approved engine');
assert.deepEqual(fs.readFileSync(path.join(distDir, 'question_bank.json')), fs.readFileSync(path.join(sourceDir, 'question_bank.json')), 'deployed question bank must remain byte-identical to the approved bank');

const typeCodes = bank.types.map((type) => type.code).sort();
assert.deepEqual(Object.keys(profiles).sort(), typeCodes, 'every literary type needs exactly one public profile');
for (const code of typeCodes) {
  const profile = profiles[code];
  for (const field of ['name', 'motive', 'figure', 'work', 'quote', 'essence', 'blindSpot', 'story', 'image', 'alt']) {
    assert.equal(typeof profile[field], 'string', `${code}.${field} must be text`);
    assert.ok(profile[field].trim().length > 0, `${code}.${field} must not be empty`);
  }
  const imagePath = path.resolve(distDir, profile.image.replace(/^\.\//, ''));
  assert.ok(imagePath.startsWith(distDir + path.sep), `${code} image must stay inside dist`);
  assert.ok(fs.statSync(imagePath).size > 100_000, `${code} portrait must be a substantial image asset`);
  const magic = fs.readFileSync(imagePath).subarray(0, 3).toString('hex');
  assert.equal(magic, 'ffd8ff', `${code} portrait must be JPEG`);
  for (const width of [480, 960]) {
    const optimized = fs.readFileSync(imagePath.replace(/\.jpg$/, `-${width}.webp`));
    assert.equal(optimized.subarray(8, 12).toString(), 'WEBP');
    assert.ok(optimized.length < fs.statSync(imagePath).size, 'responsive portraits must save bandwidth');
  }
}
for (const font of ['romantic-serif-sc', 'cormorant', 'cormorant-italic']) {
  const data = fs.readFileSync(path.join(distDir, 'assets/fonts', `${font}.woff2`));
  assert.equal(data.subarray(0, 4).toString(), 'wOF2');
}

assert.deepEqual(Object.keys(resultStatus).sort(), ['distributed', 'dual', 'focused', 'insufficient']);
assert.deepEqual(Object.keys(traitCopy).sort(), ['A', 'C', 'E', 'N', 'O']);
for (const file of ['index.html', 'styles.css', 'app.mjs', 'share.mjs', 'engine.mjs', 'profiles.mjs', 'question_bank.json']) {
  assert.ok(fs.statSync(path.join(distDir, file)).size > 0, `${file} must be present`);
}
assert.equal(fs.readFileSync(path.join(distDir, 'assets/questionnaire-qr.png')).subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'poster QR must be present as a PNG');

const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
assert.match(html, /<html lang="zh-CN">/);
assert.match(html, /name="viewport"/);
assert.match(html, /<script type="module" src="\.\/app\.mjs"><\/script>/);
assert.match(html, /id="announcer"[^>]*aria-live="polite"/);

console.log('PASS package integrity, approved scoring assets, 16 complete profiles, 16 JPEG portraits, and accessibility shell');
