# ROMANTIC16 Questionnaire Design

Version 0.1. Original design; not psychometrically validated.

This English specification describes the existing Chinese questionnaire. Exact respondent-facing wording, type definitions, item IDs, adaptive templates, parameters, and source metadata remain in `questionnaire-engine/question_bank.json`. The reference implementation is `questionnaire-engine/engine.mjs`.

## 1. Product scope and measurement boundaries

The design combines 15 continuous behavioral style statements, 8 most-like/least-like scenarios, and 2–4 adaptive follow-ups. A completed route contains 25–27 questions and 33–35 scored choices. The 3–5 minute budget needs testing with the intended users on phones.

Literary archetypes describe motivations a respondent more often prioritizes. Continuous style clues describe how those motivations are expressed. A quiet FREE or a gentle PLAN is possible: the initial model does not hard-code a mapping from Big Five traits to literary characters.

The 16 archetypes are authored interpretive categories, not established natural personality classes. These original items do not inherit the reliability or validity of BFI, MBTI, or another instrument. The intended initial validation population is Chinese-reading adults aged 18 or older using a low-risk self-exploration product. Results must not determine clinical diagnosis, hiring, personality worth, or relationship compatibility.

## 2. Research-informed design principles

- MBTI inspires memorable preference language, without copied items or an assumption that continuous preferences form natural dichotomies.
- The Big Five framework broadens behavioral coverage across extraversion, agreeableness, conscientiousness, negative emotionality, and openness. Fifteen original items provide only coarse clues; published BFI-2 findings do not validate them.
- Schwartz's value framework motivates trade-offs between compatible or conflicting priorities under limited resources.
- Situational judgment research distinguishes typical behavior from the behavior considered most appropriate. The questionnaire asks what respondents usually do, while recognizing ideal-self and context effects.
- Best–worst responses provide relative preferences. A sequential most-like then least-like model matches the interface; it does not establish absolute trait levels or remove self-report bias.
- Rule-based adaptive follow-ups target close candidates and check a new candidate. Without calibrated items, this is not an IRT-CAT with known measurement error.
- Liking a personality description does not prove accuracy. Feedback should retain answer evidence, candidate distinctions, and uncertainty.

References below support design principles, not the validity of this question bank.

## 3. Administration and time budget

Ask respondents to consider their usual behavior over the last six months rather than their ideal self. The design allows choosing a comparable experience or skipping when judgment is impossible. The current website and Mini Program instead implement a complete-answer flow without a skip control; engine-level missing-answer support remains available.

Hide character names, type codes, trait labels, scoring directions, utilities, and specialized pair IDs during answering. Literary presentation belongs in the visual background and results. Items must not require reading the novels, artistic skill, romantic experience, or financial privilege.

| Component | Count | Budget per item | Subtotal |
| --- | ---: | ---: | ---: |
| Instructions | 1 | 15–20 seconds | 15–20 seconds |
| Style statements | 15 | 4–5 seconds | 60–75 seconds |
| Most-like/least-like scenarios | 8 | 12–18 seconds | 96–144 seconds |
| Adaptive follow-ups | 2–4 | 10–15 seconds | 20–60 seconds |

These are design estimates. Do not penalize slow reading, impose a forced countdown, or count time away from the page as active response time.

## 4. Continuous style statements

Response scale: 1 = very unlike me; 2 = somewhat unlike me; 3 = in between; 4 = somewhat like me; 5 = very like me. An unavailable or declined answer is missing, not 3.

The descriptions below explain item content in English; they do not replace the original Chinese stimuli.

| ID | Item content | Dimension | Direction |
| --- | --- | --- | --- |
| T01 | Starting conversations with less familiar people | Extraversion | Positive |
| T02 | Planning steps before an important task | Conscientiousness | Positive |
| T03 | Asking what a person in difficulty needs | Agreeableness | Positive |
| T04 | Repeatedly worrying about unresolved outcomes | Negative emotionality | Positive |
| T05 | Wanting to understand unfamiliar things | Openness | Positive |
| T06 | Preferring solitude after sustained social contact | Extraversion | Reverse |
| T07 | Completing a promised contribution after interest fades | Conscientiousness | Positive |
| T08 | Initially trusting a reasonable explanation | Agreeableness | Positive |
| T09 | Taking time to recover emotionally after disrupted plans | Negative emotionality | Positive |
| T10 | Noticing subtle changes in words, music, or images | Openness | Positive |
| T11 | Proposing a next step when a group is waiting | Extraversion | Positive |
| T12 | Deciding next steps while working instead of planning the order | Conscientiousness | Reverse |
| T13 | Pointing out disagreement without softening the delivery | Agreeableness | Reverse |
| T14 | Recovering relatively quickly from minor setbacks | Negative emotionality | Reverse |
| T15 | Revisiting familiar favorites instead of unfamiliar ideas | Openness | Reverse |

Reverse scoring uses `6 − response`. Average answered items within each dimension and require at least two responses to supply a coarse clue. An internal transformation `25 × (mean − 1)` is neither a population percentile nor a percentage of personality.

These items do not enter the 16-archetype motivation ranking. Do not interpret openness as intelligence, agreeableness as moral worth, or negative emotionality as mental illness. A future trait-to-archetype mapping would require independent evidence of incremental validity.

## 5. Core scenarios

Each scenario presents four options. Select the most-like option first, then the least-like among the remaining three; the selections must differ. The other two options have no known ordering. The original design permits skipping a whole scenario rather than inventing a response.

Display scenarios in this order: `S1 → S5 → S2 → S6 → S3 → S7 → S4 → S8`. Shuffle option positions using the session seed and preserve that mapping across rerenders.

| Scenario | Context | Hidden options and their priorities |
| --- | --- | --- |
| S1 | Starting a small collaborative activity with unresolved disagreement | FREE: autonomy over one's part; FIRE: support for a worthwhile shared direction; DARE: a low-cost trial; PLAY: a playful way to restart discussion |
| S2 | Maintaining a valued relationship with one evening per week | LOVE: mutual emotional understanding; OATH: an existing commitment; CARE: the other's current needs; HOME: a stable shared routine |
| S3 | Beginning an unfamiliar project with little preparation time | RULE: rules and responsibilities; PLAN: goals, steps, contingencies; MASK: participants' concerns and communication; MIND: principles and unknowns |
| S4 | Spending an evening without mandatory tasks | MUSE: making something from feelings; MIST: reflecting on desired life; VEIL: privately processing feelings; WINE: a directly enjoyable activity |
| S5 | Revising a personally important part of collaborative work | FREE: retaining choice; LOVE: having feelings understood; RULE: equal agreed standards; MUSE: preserving authentic expression |
| S6 | Continuing or leaving a difficult multiweek commitment | FIRE: worthwhile change; OATH: a promise to a particular person; PLAN: a chosen long-term goal; MIST: understanding personal meaning |
| S7 | Joining a group without urgent work in the first week | DARE: trying a new task; CARE: helping with a need; MASK: observing concerns and adapting communication; VEIL: friendliness with private boundaries |
| S8 | Sharing two free hours with familiar people at similar cost | PLAY: improvisation; HOME: familiar comfortable routines; MIND: exploring a question; WINE: enjoying favored food or entertainment |

Every archetype appears exactly twice and is directly compared with six other archetypes. The comparison graph is connected. Equal exposure is not a fully balanced all-pairs design; eight scenarios still provide little evidence for any one type.

Least-like does not mean complete absence. Not choosing CARE does not establish a lack of compassion. Financial pressure, familiarity, and emotional state can influence responses and require pilot examination.

## 6. Adaptive content

Engine-level response options are closer to A, closer to B, about equal, or neither/unable to judge. The current product exposes A, B, and equal. Hidden archetype mappings are not shown.

Two formats are available: trade-off and past behavior. Ask each unordered pair at most once per format. Randomize A/B positions and preserve the actual mapping.

### Specialized trade-off pairs

| ID | Pair | Distinction |
| --- | --- | --- |
| D01 | FREE × FIRE | Returning to personal priorities once autonomy is restored versus continuing shared reform |
| D02 | DARE × PLAY | Learning through a new challenge versus improvisational play without a required outcome |
| D03 | PLAY × WINE | An evolving unfamiliar game versus an already known source of enjoyment |
| D04 | LOVE × OATH | Emotional expression and reciprocity versus keeping commitments and remaining reliable |
| D05 | OATH × CARE | An earlier promise to a particular person versus a more urgent present need |
| D06 | CARE × HOME | Flexible help for changing needs versus preserving established stability |
| D07 | RULE × PLAN | Reconfirming consistent shared standards versus adjusting methods for goals and costs |
| D08 | PLAN × MIND | Using an effective method toward a goal versus first understanding its mechanism |
| D09 | PLAN × MASK | Examining goals, steps, and resources versus participants' concerns and motives |
| D10 | MUSE × MIST | Turning a feeling into expression versus understanding its meaning without producing work |
| D11 | FREE × VEIL | Discomfort with needing approval versus disclosing vulnerability before readiness |
| D12 | LOVE × VEIL | Expressing care despite uncertain reciprocity versus first checking the other's position |

Use the specialized item when its pair is selected for a trade-off round. Exact scenarios and alternatives are in the question bank.

### Generic fallback templates

Trade-off prompt: in an important situation where not every need can be met, which cost would you usually accept? Past-behavior prompt: over the last six months, which behavior happened more often, rather than seeming more admirable?

| Code | Accepted trade-off | Past behavior |
| --- | --- | --- |
| FREE | Autonomy with less ready-made support | Following personal judgment despite disagreement |
| FIRE | Shared change despite opposition | Persuading or organizing others to improve shared work |
| DARE | A new route with possible wasted effort | Trying something without complete certainty |
| PLAY | Improvisation with less predictability | Changing a game or approach to revive a dull atmosphere |
| LOVE | Expressing care without equal reciprocity | Expressing care first and hoping for a response |
| OATH | Keeping a promise with less freedom to change plans | Keeping a promise to a particular person despite inconvenience |
| CARE | Helping others while postponing personal plans | Making time for another's concrete difficulty |
| HOME | Reliable routines with fewer novel opportunities | Maintaining arrangements that keep daily life stable |
| RULE | Consistent standards with less flexibility | Requiring agreed standards when an exception is requested |
| PLAN | Long-term plans over an immediate temptation | Forgoing immediate gratification for a later goal |
| MASK | Adapted expression without always saying everything | Changing wording and presentation for the audience |
| MIND | Understanding first at the cost of speed | Investigating a mechanism even without immediate use |
| MUSE | Authentic expression without broad approval | Turning a feeling into personally meaningful work |
| MIST | Time for meaning without an immediate answer | Reflecting on desired life without rushing a conclusion |
| VEIL | Inner privacy with less accessibility to others | Limiting disclosure of vulnerability even with trust |
| WINE | Present enjoyment over a nonessential task | Arranging a concrete small pleasure on an ordinary day |

Show only the two candidates' sentences. The 16 fallback entries cover all 120 unordered pairs operationally; this does not establish equal discrimination across pairs.

## 7. Routing and stopping

Complete the fixed statements and scenarios before routing follow-ups; do not permanently eliminate an archetype early.

1. A1: fit all 16 utilities and compare the top two with a specialized or generic trade-off item.
2. A2: refit all utilities, compare the current leader with the highest-ranked candidate not previously included in a follow-up, and use past behavior. This explicitly checks a new candidate.
3. A3, when needed: refit, compare the leader with the closest candidate having an unused format; prefer past behavior, otherwise trade-off.
4. A4, when still needed: repeat the A3 rule, then stop regardless of concentration.

Session-seeded tie breaking prevents always prioritizing the first array entry. A scoring tie must not be presented as a certain personality difference.

The initial focused-result stopping conditions must all hold:

- At least 6 of 8 valid core scenarios.
- At least two adaptive answers and at least one explicit A/B choice.
- The leader stays unchanged across the two most recent updates.
- The first/second utility gap is at least 0.5.
- Removing each valid core scenario in turn leaves the same uniquely leading type in at least 80% of fits.
- At least two positive supports for the leader, including one from a core scenario.

The thresholds 0.5 and 80% are engineering defaults. Leave-one-core-out retention tests scoring sensitivity conditional on the already asked route. It is not test–retest reliability, rerouted stability, confidence, or an 80% accuracy claim.

After at most four follow-ups, use focused when its conditions hold. Dual requires a first/second gap below 0.5, a second/third gap of at least 0.25, and positive support for both top types. Otherwise use distributed. Fewer than six valid core scenarios or no explicit adaptive choice produces insufficient evidence.

Revising a core answer invalidates all subsequent adaptive answers. Clear them and reroute rather than silently preserving an obsolete comparison path.

## 8. Scoring model

Assign a relative utility `s` to each type. It is not intelligence, virtue, disease severity, a personality probability, or a population percentile.

For core candidate set `B`, most-like choice `b`, and least-like choice `w`:

```text
P(b, w | s) = [exp(s_b) / sum(t in B) exp(s_t)]
            * [exp(-s_w) / sum(t in B except b) exp(-s_t)]
```

This models the actual sequential interface. Do not treat all inferred pairwise relationships within one scenario as independent questions.

For a follow-up, `d = s_A − s_B`. A has `r = 1`; B has `r = 0`. Its loss is `log(1 + exp(d)) − r*d`. Equal uses `r = 0.5` and weight 0.5 as a weak relative-equality constraint. Neither adds no utility evidence and records a fit/coverage warning.

```text
L = 0.5 * lambda * sum(s^2)
  + sum(core negative log choice probabilities)
  + sum(weighted adaptive losses)
```

Initial `lambda = 1`; core scenarios and explicit follow-up choices have weight 1. Regularization limits extreme estimates from sparse choices. This is not calibrated IRT: item difficulty, discrimination, and context effects have not been estimated.

All candidates are fitted jointly rather than receiving extra points for repeated exposure. Joint fitting still does not remove wording attractiveness, context, or selection biases.

The five continuous style clues remain separate. Low extraversion should constrain an otherwise public-facing FREE description; high agreeableness does not make PLAN cold; negative emotionality does not assign MIST or VEIL.

## 9. Feedback requirements

Prefer an archetype or pair, one motivation, two or three actual answer-based reasons, one style clue, a distinction from a nearby type, a clearly tentative possible cost, and the concentration of this result.

Use only evidence supported by the answers. CARE does not imply people-pleasing; VEIL does not imply avoidant attachment; MASK does not imply malice; RULE does not establish moral superiority; MIND does not establish intelligence. Do not infer trauma, attachment disorders, narcissism, or depression.

Literary titles may be expressive, but they cannot replace evidence. Utilities, sigmoid values, margins, and leave-one-out retention must not become claims such as a 93% probability of being MIND.

## 10. Validation plan

Sample sizes below are planning budgets, not guaranteed statistical thresholds. Determine final sizes through simulations and precision planning for parameter complexity, type prevalence, missingness, and target error.

| Stage | Proposed sample | Purpose |
| --- | --- | --- |
| A | 15–25 cognitive interviews | Explain each item, recall actual events, detect double meanings, unfamiliar contexts, ideal-self responding, and obviously admirable options |
| B | 80–120 phone pilots | Examine completion-time distributions, dropout, missingness, selection errors, and independent desirability ratings |
| C | Approximately 600–1000 development participants | Calibrate wording, context effects, regularization, and thresholds with consented sampling and independent behavioral/personality/value measures |
| D | Approximately 150–200 retests after 2–4 weeks | Report score correlations/ICC, leading-type agreement, top-two overlap, and intervals |
| E | Blinded result comparison | Compare true, neighboring, and random descriptions matched for length and positivity, with suitable disclosure and debriefing |

Check whether MUSE is mistaken for artistic skill, MIST for temporary confusion, and VEIL for introversion alone. In phone pilots, report the median and 90th percentile, not just the mean. Compare a most-like-only version if least-like choices add excessive burden. More apparent information is not automatically better measurement.

Split development and held-out validation data by person. Do not tune the model to produce an even distribution across the 16 types. Evaluate predictions of unscored behavior or subsequent behavior, not only agreement with a flattering description.

Prioritize content coverage, interpretation consistency, missingness, time, each style scale's structure and reliability, convergent/discriminant relationships, retest stability, neighboring-type confusion, uncertain-result rates, held-out prediction, and fixed versus adaptive questionnaires at equal time budgets. Do not compute a single alpha for the entire heterogeneous instrument.

When samples permit, examine measurement equivalence or differential item functioning across age, gender, and education. Demographics must not assign personality types.

There is no natural gold standard for these 16 types. Favorite characters, the model's prior labels, and one-time satisfaction cannot substitute for true labels. Define measurable motivations and triangulate with independent methods. If two archetypes remain indistinguishable, revise definitions, add discriminating content, or accept mixed results.

## 11. Implementation and data handling

The system can run entirely on the client without login, birth date, gender, name, location, or health information. Do not route by gender or send answers to an LLM for a final judgment. Use traceable scoring rules and reviewed templates.

For research instrumentation, preserve version, session seed, item IDs, actual option order, raw answers, skip markers, and adaptive candidate/format metadata. Separate active viewing time from time away. Actual research collection requires a distinct explanation of purposes, retention, and withdrawal; it is not implemented by publishing this repository.

Support revision, keyboard access, readable type, and reduced motion. Share cards should reveal only voluntarily shared results, not raw answers. Reading speed is not personality or a standalone invalidity criterion.

## 12. Reference package

- `question_bank.json`: all fixed items, 12 specialized comparisons, generic coverage for 120 pairs, parameters, and sources.
- `engine.mjs`: answer validation, style scoring, utility fitting, adaptive routing, and result states, with no external dependencies.
- `test_engine.mjs`: engineering tests, including simulated response routes; not validity testing.
- `engineering_checks.txt`: recorded engineering output from the reference package.
- `README.md`: integration examples and data semantics.

Engineering correctness shows that the implementation follows its rules. It does not demonstrate accuracy on real people. Cognitive interviews and phone pilots should precede claims about practical measurement performance.

## Research references

- McCrae & Costa (1989). *Reinterpreting the Myers-Briggs Type Indicator From the Perspective of the Five-Factor Model of Personality*. DOI: 10.1111/j.1467-6494.1989.tb00759.x.
- Soto & John (2017). *Short and extra-short forms of the Big Five Inventory–2: The BFI-2-S and BFI-2-XS*. DOI: 10.1016/j.jrp.2017.02.004.
- Schwartz (2012). *An Overview of the Schwartz Theory of Basic Values*. DOI: 10.9707/2307-0919.1116.
- Lievens, Sackett & Buyse (2009). *The Effects of Response Instructions on Situational Judgment Test Performance and Validity in a High-Stakes Context*. [Source](https://www.researchgate.net/publication/26663123_The_Effects_of_Response_Instructions_on_Situational_Judgment_Test_Performance_and_Validity_in_a_High-Stakes_Context).
- Marley & Louviere (2005). *Some probabilistic models of best, worst, and best–worst choices*. [Source](https://www.sciencedirect.com/science/article/abs/pii/S0022249605000441).
- Bürkner, Schulte & Holling (2019). *On the Statistical and Practical Limitations of Thurstonian IRT Models*. DOI: 10.1177/0013164419832063.
- Rudick, Yam & Simms (2013). *Comparing Countdown- and IRT-Based Approaches to Computerized Adaptive Personality Testing*. DOI: 10.1037/a0032541.
- Forer (1949). *The fallacy of personal validation; a classroom demonstration of gullibility*. DOI: 10.1037/h0059240.
