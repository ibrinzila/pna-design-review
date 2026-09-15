# Advisory design review: does PNA support the intended agency?

15 September 2026. This review assesses the design argument and observed workflows. It does not certify the legal truth of the programme or judge every assessment in a comparator.

## Reconstructed argument

PNA's original design makes an opaque programme searchable, understandable, source-linked and correctable. Immutable documents and distinct review events protect evidence and accountability. Those are sound foundations. The owner's expanded outcome is that citizens, researchers, civil society and government can investigate implementation, compare and challenge assessments, contribute evidence and follow the consequence. That requires an assessment-and-response model in addition to a document catalogue. The visual system should make that model usable; a collection of dashboards cannot substitute for it.

## Ranked findings

### 1. Blocking for an implementation tracker: the thing being tracked is not modelled

**Evidence.** All 2,779 public records have `implementation: not-assessed`. The current data has a planned indicator and source-cell evidence, but no series of observed values, status decision, assessment rubric or dependency from an assessment to an aggregate. The [methodology](https://pna.md/despre/) explicitly keeps implementation unverified. See selected [schema](source/db/schema.ts) and [action screen](screens/02-action-desktop.png).

**Why it matters.** A new status colour or 2.5/5 display would have no stable meaning to inspect, correct or recompute. Reading a target as an achieved result is exactly the error this product needs to prevent.

**Resolution.** Establish a small typed assessment contract before designing progress components: subject, measure type, expected result, observed value/status, period, assessor, method version, evidence and contrary evidence, decision state and revision. Keep qualitative readiness, annual progress, delivery milestones, numeric outputs and social outcomes distinct. Map recommendations and benchmarks to actions through attributed, reviewable relations; do not assume one-to-one coverage or average arbitrary categories.

**Confidence:** high. **Would change my mind:** an implemented and populated assessment model outside the inspected source with traceable decisions and aggregate rules. This finding does not block the existing catalogue.

### 2. Substantive: evidence is available but the user's place is not preserved through verification

**Evidence.** The action page expands a quoted passage and links to the PDF page. Cell coordinates are downloadable in JSON. The document view exposes extracted pages separately. The private editor can embed a whole PDF but does not highlight the selected claim's cell or automatically follow every selected citation. See [expanded indicator](screens/03-indicator-evidence-desktop.png), [document view](screens/10-document.png), and [current renderer](source/assets/editorial.js).

**Why it matters.** The user still does the work of locating the relevant cell and rebuilding table context. On a phone, source and decision can be separated by a long scroll. A citation is available, but rapid verification is not established.

**Resolution.** Compare a contextual source drawer, a split workspace and a full-screen mobile source view. Preserve the selected claim and return position. Show the exact passage, document identity and nearby headers/rows, with a clear path to the full original. Use existing coordinates where reliable; show an explicit fallback when highlighting is unavailable or uncertain.

**Confidence:** high for the observed navigation gap; medium for the best layout. **Would change my mind:** representative task observations showing that current navigation already supports rapid accurate verification without losing work.

### 3. Substantive: a contribution can receive a decision, but it cannot yet complete the intended accountability loop

**Evidence.** [Current contribution logic](source/assets/app.js) supports submission, a private receipt, moderation and a public accepted note. Acceptance does not update implementation or a public explanation automatically. There is no attributed authority-response step, organisational assessment, assignment, due response date, follow subscription or downstream change notification. The [public methodology](https://pna.md/despre/) promises no response time until operating capacity is agreed.

**Why it matters.** “Contribute” may become a one-way inbox if there is no accountable owner and no visible consequence. Citizens, government respondents and independent assessors have different authority; one generic moderator role does not describe them.

**Resolution.** Design the loop as a case: contribution → evidence checks → response/adjudication → disposition → changed assessment/publication → follow-up. Define who may assert, respond, review and publish. Preserve rejected and unresolved outcomes with appropriate privacy. Measure response completion and useful corrections, not submission counts.

**Confidence:** high. **Would change my mind:** an adopted operating process and working product path that supplies these steps outside the inspected pages. A follow subscription should be opt-in; do not add notifications implicitly.

### 4. Substantive: opening the production review queue is the wrong way to make a design review accessible

**Evidence.** The 53-record pilot is deliberately allowlisted. Its workflow includes private notes, individual identity and a frozen independent-review protocol. Live editorial events were empty at this audit, but that can change. Selected [server code](source/server/index.js) and [editorial policy](source/server/editorial-policy.js) enforce the boundary.

**Resolution.** Use the owner-approved public pack and separate demonstration. Give the outside reviewer frozen screens, public-source cases, stable state URLs and current UI source. Demonstration saves must never reach production, and sample decisions must not be presented as real reviews. Do not disclose the private pilot bundle, user identifiers, receipt keys or an unredacted production queue. State which behaviors are mirrored, simulated or absent.

**Confidence:** high. **Would change my mind:** a deliberately read-only public projection with an explicit disclosure policy; that still would not justify exposing private submissions or expanding production write access.

### 5. Substantive: readiness and evidence status need several dimensions

**Evidence.** The current product already distinguishes indexing, AI review, human review and implementation. Legal correspondence with the adopted annex remains unresolved. IPRE separately shows preparation and annual progress; its recommendations dashboard shows the EC report's assessment of previous recommendations at area level. See the [comparison research](RESEARCH.md).

**Why it matters.** Collapsing these into “verified,” a traffic light, or a percentage would hide uncertainty and misattribute authority. A changed source also does not automatically establish changed implementation.

**Resolution.** Retain distinct source-currentness, extraction quality, claim support, assessor/review status, implementation assessment and dispute states. Present only the dimensions relevant to the current task, with progressive disclosure. Explain original measure, mapping and denominator beside derived values.

**Confidence:** high. **Would change my mind:** a validated narrower domain in which one status has one agreed meaning and cannot hide these distinctions.

## What to preserve, and what is open

Preserve stable action/source identifiers, retained originals, citation and field anchors, append-only review history, privacy, explicit unknowns and public access to reading. Keep the existing explanation-completion and legal-correspondence work in scope; a design exercise does not complete or replace it.

The layout, component set, navigation, visual density and division into workspaces are open. Start with user jobs and the evidence/assessment contract, then compare alternative compositions. Typography and a more attractive dashboard are insufficient acceptance criteria.

## Practical design directions to compare

1. **Extend the current pages:** add typed assessments, an evidence drawer and follow/change views around existing records. Least migration, but risks keeping research and contribution fragmented.
2. **Use an evidence-linked case as the main working unit:** a public reading view can deepen into source comparison, contribution, response and history without losing context. Recommended direction to test because it joins the user's intended loop and reuses source/revision primitives; it needs a real assessment and responsibility model.
3. **Reorganise around issues and collaborative workspaces:** citizens follow issues while organisations assemble assessment/report cases across actions. Stronger synthesis and collaboration, but more navigation, role and operational complexity. Do not make this the default before testing the smaller case model.

These are advisory directions, not an approval to rebuild. Ask each external designer to use the same cases and preserve the same evidentiary rules.

## Evaluation boundary

This was an informed agent review of source, live screens and selected interactions, not fresh-eyes human usability research. For the expanded tracking outcome the HUG verdict is **fail-implement**: essential tasks are absent. The catalogue's existing value is preserved; no new human-readiness claim is made. An outside designer can assess a demonstration, but simulated saves do not establish production persistence or human agency.
