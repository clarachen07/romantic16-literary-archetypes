# ROMANTIC16 v0.1 implementation

This is an original, **unvalidated** literary-archetype exploration prototype. Engineering correctness is not psychometric validity. Read [the questionnaire design](../docs/questionnaire-design.md) before use.

## Files and execution

No dependencies are needed for the ES module engine. Run the engineering checks in Node.js:

```sh
node test_engine.mjs
```

In a browser, serve these files through the same ordinary web server as your app, rather than opening a local file URL:

```js
import { nextQuestion, analyze } from './engine.mjs';
const bank = await fetch('./question_bank.json').then(r => {
  if (!r.ok) throw new Error(`Cannot load question bank: ${r.status}`);
  return r.json();
});
const seed = crypto.randomUUID(); // persist this with the session
const state = { anchors: {}, core: {}, adaptive: [] };

function getCurrentQuestion() {
  return nextQuestion(bank, state, seed); // null means the questionnaire is finished
}

function submit(question, response) {
  if (question.kind === 'anchor') {
    // response is integer 1..5 or null for skipped
    state.anchors[question.id] = response;
  } else if (question.kind === 'core') {
    // response is {best: 'FREE', worst: 'PLAY'} or null.
    // Use the actual option's hidden type, never its screen position.
    state.core[question.id] = response;
    state.adaptive = []; // invalidate old adaptive route if revising a core answer
  } else if (question.kind === 'adaptive') {
    // response is 'a', 'b', 'equal', or 'neither'.
    state.adaptive.push({
      a: question.a, b: question.b, format: question.format,
      source: question.source, answer: response
    });
  }
  const next = getCurrentQuestion();
  return next ?? analyze(bank, state, seed);
}
```

Show respondents only the text and response labels. Never show hidden type keys, trait labels, key direction, raw utilities, or specialized pair identifiers while they answer. Do not call `analyze` a diagnostic function in the UI.

## Data semantics

- An absent answer key means not yet answered. `null` means intentionally skipped.
- Both core choices must be distinct and belong to that block. A missing core block is not scored as neutral.
- For adaptive questions, `a` and `b` refer to the actual displayed randomized A/B mapping.
- `equal` supplies a weak relative-equality constraint, not an absolute endorsement of either type.
- `neither` supplies no utility evidence and counts as a fit/coverage warning.
- The 15 anchors only produce coarse continuous-style clues; they do not determine literary type ranking in v0.1.
- A result can be `focused`, `dual`, `distributed`, or `insufficient`. `primary` is deliberately null outside `focused`.
- `conditionalLeaveOneCoreOutRetention` is a scoring sensitivity statistic for the fixed route. It is not a confidence level, test-retest reliability, or probability the result is true.

## Revisions and routing

Editing a core answer invalidates all later adaptive answers. Restart adaptive routing rather than reusing answers to outdated comparisons. Use a fresh random seed for a new session, and preserve the seed during a session so re-rendering does not reshuffle options.

## Known limitations

The option meanings, social desirability, trait scale structure, utility-model assumptions, ridge strength, and stopping thresholds have not been calibrated on human data. The generic templates cover all 120 type pairs only in the engineering sense, not with demonstrated equal discrimination. No claim of a stable real-world accuracy rate is supported by this package.

The JSON and module can run client-side without transmitting answers. Any research data collection requires separate transparent consent and appropriate privacy handling.
