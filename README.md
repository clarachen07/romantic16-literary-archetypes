# ROMANTIC16 · Literary Archetypes

[English](README.md) · [简体中文](README.zh-CN.md)

A literary archetype exploration experience inspired by French Romantic literature. ROMANTIC16 combines a short adaptive questionnaire, 16 illustrated character profiles, and shareable result posters in a static website and a native WeChat Mini Program.

**[Try the questionnaire](https://romantic16.netlify.app/)**

![ROMANTIC16 archetype overview](output/posters/romantic16-4x4-poster-v3.png)

## Features

- 15 behavioral style statements, 8 most-like/least-like scenarios, and 2–4 adaptive follow-ups: 25–27 questions per completed session.
- Four result states: focused, dual, distributed, and insufficient evidence.
- 16 literary archetypes with illustrations, motivations, stories, and reflection prompts.
- Local progress recovery, answer revision, restart, and record deletion.
- Result posters generated locally; native image sharing and album saving in the Mini Program.
- A self-contained classroom presentation, speaker notes, and overview posters.

The interface, questionnaire, character profiles, and classroom materials remain in Chinese. Repository documentation, filenames, and development metadata use English, with this README also available in Chinese.

## Run locally

The website uses native browser modules and ships its static assets. No package installation or build step is required.

```sh
git clone https://github.com/clarachen07/romantic16-literary-archetypes.git
cd romantic16-literary-archetypes
python3 -m http.server 4173 --directory romantic16-site/dist
```

Open [localhost:4173](http://localhost:4173/). Serve the directory over HTTP rather than opening `index.html` directly.

To use the Mini Program, import `romantic16-miniprogram/` into WeChat DevTools and configure your own AppID. See the [Mini Program guide](romantic16-miniprogram/README.md).

To view the classroom materials, open [the presentation](output/slides/romantic16-classroom.html) or [the speaker notes](output/slides/romantic16-speaker-notes.html) directly in a browser. Their embedded assets support offline viewing; external references and the linked questionnaire require a network connection.

## Repository layout

| Path | Purpose |
| --- | --- |
| `romantic16-site/` | Static website, assets, maintenance scripts, and browser checks |
| `romantic16-miniprogram/` | Native WeChat Mini Program, adapters, and local checks |
| `questionnaire-engine/` | Reference scoring engine, original Chinese question bank, and engineering checks |
| `docs/questionnaire-design.md` | English design specification and validation plan |
| `output/slides/` | Classroom presentation, speaker notes, and source files |
| `output/posters/` | Illustrated overview posters and generation prompts |

## Verification

Use Node.js 24 or later to run the included checks. They require no npm dependencies.

```sh
node questionnaire-engine/test_engine.mjs
node romantic16-site/tests/package-integrity.mjs
npm --prefix romantic16-miniprogram test
```

These checks cover scoring behavior, simulated routes, website asset integrity, Mini Program content parity, session recovery, and mocked native sharing and permission flows. The website also includes browser checks that require a running local server and a Chrome debugging session; see [the website guide](romantic16-site/README.md).

## Design and privacy

Literary archetypes describe relative motivations; five separate continuous style clues describe how those motivations may be expressed. Style clues do not determine the archetype ranking. See [the design specification](docs/questionnaire-design.md) and [engine integration guide](questionnaire-engine/README.md).

Answers and result posters are processed locally. The application does not require an account or upload answer records. Sharing is initiated by the user; a shared poster contains its displayed result. Progress is stored on the device and can be cleared from the interface.

**This is an original, unvalidated exploration prototype.** Engineering checks do not establish psychometric validity. Results are not diagnoses, personality probabilities, or a basis for hiring or relationship decisions. The 3–5 minute duration is a design target rather than a measured completion time.

The Mini Program has no configured AppID. Local checks do not establish WeChat compilation, real-device compatibility, approval, or publication.

## Assets and maintenance

Bundled Cormorant Garamond and Noto Serif SC fonts include their SIL Open Font License notices. Preserve the notices when redistributing font assets. No project-wide software license has been selected.

ZIP exports, local deployment credentials, private WeChat configuration, and caches are excluded from version control. The website can be served from `romantic16-site/dist/`; its existing Netlify configuration publishes that directory relative to `romantic16-site/`.
