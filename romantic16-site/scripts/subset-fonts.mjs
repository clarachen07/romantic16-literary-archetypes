// Usage: node scripts/subset-fonts.mjs NotoSerifSC.ttf CormorantGaramond.ttf CormorantGaramond-Italic.ttf
// Build small, same-origin OFL assets; original licenses live alongside output.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const root = new URL('../dist/', import.meta.url);
const [serif, latin, italic] = process.argv.slice(2);
if (!serif || !latin || !italic) throw new Error('Supply the three original OFL font paths; see the usage comment.');
const text = [...new Set(['app.mjs', 'share.mjs', 'profiles.mjs', 'question_bank.json', 'index.html'].map((file) => fs.readFileSync(new URL(file, root), 'utf8')).join(''))].join('');
for (const [source, output, characters] of [
  [serif, 'romantic-serif-sc', text],
  [latin, 'cormorant', text],
  [italic, 'cormorant-italic', text]
]) {
  execFileSync('python3', ['-m', 'fontTools.subset', source, `--text=${characters}`, '--flavor=woff2', '--no-hinting', `--output-file=${new URL(`assets/fonts/${output}.woff2`, root).pathname}`], {stdio: 'inherit'});
}
