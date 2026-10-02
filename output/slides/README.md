# ROMANTIC16 Classroom Materials

The presentation and speaker notes are Chinese product content. Development instructions use English.

## View

Open `romantic16-classroom.html` directly in a browser for the 26-slide interactive presentation, or `romantic16-speaker-notes.html` for the accompanying script. Embedded images, fonts, and content allow offline use. External source links and the questionnaire QR require network access.

`romantic16-preview.jpg` is a preview image. `src/verification.json` records a prior verification run; it is historical evidence, not a fresh check of every environment.

## Sources and rebuild requirements

`src/content.mjs`, `src/app.js`, and `src/styles.css` contain the presentation content, interaction code, and layout. `src/build.mjs` embeds assets from `romantic16-site/dist/assets/` and writes both standalone HTML files.

The existing build script expects Python FontTools with WOFF2 support and a full `NotoSerifSC.ttf` font at `/tmp/romantic16-slides-research/NotoSerifSC.ttf`. It also uses that temporary directory for generated font subsets. Create the directory and supply the font before rebuilding. The font file is not bundled; opening the existing HTML does not require it.

```sh
node output/slides/src/build.mjs
```

`src/qa.mjs` expects Chrome remote debugging on port 9337 and a writable `/tmp/romantic16-slides-qa/` output directory. It exercises offline rendering, slide navigation, scenario interaction, detail views, and speaker notes. Its screenshots and reports are temporary artifacts.

Font licenses are embedded in the presentation. The literary analysis, cited translations, and project-generated descriptions are distinguished within the presentation's source panels.
