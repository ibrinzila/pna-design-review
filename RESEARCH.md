# PNA design research: traceable monitoring, correction, and accountable change

**Observation date:** 15 September 2026. **Scope:** first-party product pages, source code served by IPRE, and official/institution-owned methodologies only. “Verified” means observable in those materials; “inferred” is a design implication; “unknown” means the reviewed public surface did not establish it.

## IPRE: two distinct products, found from IPRE navigation

IPRE’s home-page navigation links to **EU Tracker** (`/eu-tracker/ipre_eu_tracker.html`) and **MD Progress** (`/eu-tracker/ipre_eu_recs_2026.html`). The latter is the “second tracker,” not a second view of the first. IPRE’s 8 April 2026 launch announcement calls them two interactive dashboards, says their data is built on the Commission’s 2023–2025 Enlargement Package assessments, and names their audience as authorities, development partners, media, civil society, academia and citizens. It also says both pages are in testing mode and invites suggestions in comments or private message. [IPRE launch announcement](https://ipre.md/2026/04/08/ipre-lanseaza-doua-dashboard-uri-interactive-pentru-monitorizarea-aderarii-moldovei-la-uniunea-europeana/?lang=en)

| Product | Verified public function and evidence model | Change / accountability surface observed |
|---|---|---|
| [EU Tracker](https://ipre.md/eu-tracker/ipre_eu_tracker.html?lang=en) | 33 acquis chapters in six clusters plus political/economic criteria; annual preparation and progress for 2023–25. Its visible legend maps preparation to **1–4** (early stage, some, moderately prepared, good level), with `+` as an intermediate level, and progress to a separate annual verbal scale. It provides three report-level EC links (2023–25). | The reviewed static page has no visible per-chapter source anchor, record timestamp, editor/author field, correction request button, or public revision history. The launch announcement supplies an organisation-level suggestions channel, but does not specify case handling or publication of outcomes. |
| [MD Progress](https://ipre.md/eu-tracker/ipre_eu_recs_2026.html?lang=en) | IPRE says it synthesises 116 recommendations across 40 areas from the Commission’s 2025 report, to monitor in 2026. It filters *area* status as partially implemented, mostly implemented, or not implemented, and shows recommendation text beneath each area. The served page links only the 2024 and 2025 EC reports in its source footer. | The reviewed page has no visible per-recommendation source anchor, item owner, evidence upload, action timestamp, public response, or change log. It is therefore a useful reading and orientation surface, but the reviewed public material does not establish a traceable correction or implementation record. |

The web server supplied a response date but no Last-Modified header for either static tracker; IPRE’s announcement is dated 8 April 2026. Do not treat the HTTP response date as a content-update timestamp.

### One score traced end to end

**Verified chain:** EU Tracker renders *Freedom of expression* as preparation `2+` for 2024 and 2025, internally represented as `2.5`, and as “good progress” in 2025. Its legend explicitly defines `2+` as between “some preparation” and “moderately prepared.” The tracker points generally to the EC Moldova Report 2025. In that official report, the Commission states that Moldova is “between having some and a moderate level of preparation” in freedom of expression and made good progress; the relevant passage also gives the underlying observations (new access-to-information law, Media Subsidy Fund, amendments, persistent ownership concentration and intimidation) and then lists three recommendations. [EU Tracker](https://ipre.md/eu-tracker/ipre_eu_tracker.html?lang=en) · [EC Moldova Report 2025, pp. 7–8](https://enlargement.ec.europa.eu/document/download/23fa6af0-89b3-4532-a3d9-d1638727d14c_en?filename=moldova-report-2025.pdf)

**Important distinction:** this is a preparation/progress judgement, not a completion calculation. The EC itself states that it uses a state-of-play scale (early → well advanced) and a distinct progress scale (backsliding → very good), including interim steps where appropriate. The report covers 1 September 2024–1 September 2025 and draws on government, EU, parliamentary, international and NGO inputs. A PNA display such as **2.5/5** must therefore label its own conversion and must never imply “50% of actions complete” unless it separately calculates completion from defined action evidence. [EC report, methodology note](https://enlargement.ec.europa.eu/document/download/23fa6af0-89b3-4532-a3d9-d1638727d14c_en?filename=moldova-report-2025.pdf)

### What the two IPRE products demonstrate

**Verified:** IPRE makes a high-level assessment legible, retains the distinction between readiness and annual progress, exposes report links, shows recommendation text, and includes a testing-mode invitation for suggestions. The MD Progress text and its three Public Administration Reform recommendations can be checked against the EC report’s corresponding passage, which says the prior recommendations were partially implemented and remain valid.

**Unknown:** the reviewed public pages do not show source passage locations for individual cards, a record of who transcribed/interpreted a source, evidence supporting a claimed action, a way for an authority to reply at the item level, or an audit trail for a correction. Absence here is only an observation about these pages, not a claim about IPRE’s internal process.

## Relevant first-party comparators

### 1. Ukraine: VoxUkraine Reform Index — evaluative score with an explicit recalculation policy

[VoxUkraine’s Reform Index methodology](https://reforms.voxukraine.org/en/method) separates an expert assessment of the expected effect of adopted regulations from implementation quality. It identifies official government sources used for selection, links experts’ questionnaires to official publications, uses a -5 to +5 scale with examples, and calculates an act’s score as the median of expert ratings. It also states a boundary that cannot be fully formalised and calls the index subjective. Most useful for correction: its annual audit may add or remove acts, move them between areas, and recalculate affected area and overall scores.

**Design implication (inferred):** for a PNA assessment, publish the rubric, the unit being scored, sources, assessor role, calculation, and a versioned “recalculated because…” event. Keep an *assessment score* separate from an *action-implementation status*; VoxUkraine explicitly makes that separation.

### 2. Open Government Partnership IRM — independent review plus government and public response windows

The [OGP Independent Reporting Mechanism Results Report process](https://www.opengovpartnership.org/documents/independent-reporting-mechanism-results-report/) evaluates commitment completion, early results, and participation. It uses desk research, interviews and repository evidence; drafts receive multi-step review, then a 21-day government/multi-stakeholder pre-publication comment period. After publication/translation, there is a 14-day public comment period; incorporated comments are published alongside the final report unless the commenter requests otherwise. The [IRM overview](https://www.opengovpartnership.org/irm-guidance-overview/) identifies the IRM as the accountability arm and describes independent oversight by an International Experts Panel.

**Design implication (inferred):** use a structured, visible case lifecycle: `contributed → evidence checked → editor decision → authority response window → published / corrected`, with the decision, reason, and public/non-public comment handling shown at the item. This gives citizens a route to flag evidence, think tanks a route to submit shadow analysis, government a defined response opportunity, and editors a recorded adjudication duty.

### 3. Our World in Data Grapher — indicator-level provenance, processing disclosure, and archived snapshots

An [OWID Grapher indicator page](https://ourworldindata.org/grapher/tuberculosis-case-detection-rate?country=TLS&tab=chart) exposes an indicator definition, source, update date, date range, unit, source citation, processing description, downloadable data/metadata, and an archived retrieval URL. Its source-and-processing pages distinguish original provider data from OWID’s processing and identify transformations such as standardisation, conversion and derived measures.

**Design implication (inferred):** each PNA indicator/score should have a stable item URL and an “evidence card”: claim, source passage/document/version, capture date, transformation or editorial rationale, assessor, status, and prior versions. Show a human-readable change note and retain the old value/source so a later correction does not erase the original public claim.

## Concrete PNA implications and limits

1. **Keep three things distinct on every item:** (a) source assessment/score, (b) action completion, and (c) evidence confidence. A score may describe readiness or expected impact; it does not prove that an action occurred or worked.
2. **Make “inspect precise evidence” a first-class route:** click a score/status to an immutable item URL containing a quoted/paraphrased source passage within copyright limits, page/section locator, document version, retrieval date, and the editor’s mapping rule. Report-level links alone are insufficient for rapid verification.
3. **Use role-bounded workflow:** citizen submits a correction/evidence lead; think tank submits a shadow assessment with sources; government provides an attributed response/evidence; editor accepts, rejects, or requests more evidence. None may silently overwrite the original record.
4. **Publish a change ledger:** timestamp, actor role (and named organisation where public), old/new value, reason, evidence links, editor decision, and whether a government response is pending. Permit private submissions for safety, but publish the decision rationale when possible.
5. **Do not manufacture a five-point metric from EC language without a documented conversion.** IPRE’s visible preparation scale is 1–4 with intermediate `+`; EC uses qualitative readiness and progress scales. A PNA 2.5/5 display needs a labelled conversion or calculation and the original qualitative judgement beside it. IPRE’s averages use a /5 denominator while the visible legend lists four categories; a designer should explain the full scale rather than infer that the observed categories are its theoretical maximum.

**Limit:** this note verifies public product surfaces and methodologies, not the correctness of every IPRE transcription, every EC judgement, or real-world implementation. The IPRE pages are explicitly in testing mode; their public change process should be treated as **unknown** beyond the stated invitation for suggestions.
