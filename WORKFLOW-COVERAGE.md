# Workflow coverage and replay guide

Read the evidence tier beside each screen. `live-public` captures show public page content; the browser was signed in as the operator. `mirrored-current-ui-synthetic-state` captures run current rendering with public fixtures. Neither establishes fresh human usability, production persistence or legal approval.

## Current routes and material states

| Route family / workflow | Coverage in this pack | Remaining limit |
|---|---|---|
| Home, search and filters | Desktop/mobile, query results, filtered results and no results | No full combinatorial filter or pagination audit |
| Chapters and action records | Chapter list/detail, reviewed and unreviewed records, extraction gap, conflict | Representative records only |
| Evidence and documents | Expanded field quote, document page, original PDF link, attempted embedded preview | No selected-passage highlighting; PDF rendered in Brave but was blank in the in-app browser |
| Methodology and history | Current explanation/implementation distinctions, correction history and archived record | Human legal acceptance remains unknown |
| Contribution | Isolated citizen form, sample submission and synthetic receipt link | Does not establish real submission storage or editorial response time |
| Receipt | Pending, accepted, rejected, needs information and missing/incorrect key | Status chosen by scenario; no cross-page persistent state |
| Editorial claim review | Three public cases, per-claim choices, reason, saved judgment and synthetic AI comparison | Real private pilot and people excluded |
| Editorial correction | New revision form and save; prior review history remains tied to old revision | No new-source editor or full operational workflow |
| Recovery/access | Stale save rejection and retained notes, recovery/retry, denied, empty and save-unavailable states | Concurrency and outages are scripted, not live backend failures |
| Moderation | Sample queue and decision form; denied role | No real queue or identity; publication is simulated |
| Assessment, response and following | J2, J6, J7 described in brief | Not implemented; there are no truthful current screenshots of these paths |

## Repeatable editorial exercise

1. Open `demo/editorial.html#demo-26-b-22-2026-09-10` for the annual youth-centres target. Inspect the title, original wording and planned indicator. The point is to distinguish a target from proof of delivery.
2. Open each cited PDF page or attempt the embedded preview. Choose a verdict for each of the three claims, choose an overall conclusion, and write a reason of at least 20 characters. Use conspicuously synthetic wording when saving an example.
3. Save. Inspect the confirmation and expand the review history. The sample AI verdict becomes visible only after the demonstration judgment. Neither is a genuine review.
4. Expand “Corectează propunerea,” edit text, and save a new version. The new version requires fresh review; previous events remain historical.
5. Reload the page. The exercise returns to its starting state with no saved decisions.

For stale-work recovery, start the same case with `?state=stale`. The first save returns a simulated conflict; use “Reîncarcă fișa și păstrează notele,” compare the current record, and deliberately retry. `?state=unavailable` demonstrates a failed save with text retained. `?state=denied` and `?state=empty` expose access and empty-work states. These URLs are linked from the pack so a reviewer does not need to assemble them.

## Repeatable citizen exercise

Open `demo/action.html`, submit a sample correction with at least 20 characters and an HTTPS source address, and open the generated receipt. The original content and sample submission are public-source demonstrations. No message is sent. The receipt carries a fixed public example key in the fragment; removing or changing it must show the missing/incorrect-key state.

Use the pack's named receipt links to compare pending, needs-information, rejected and accepted outcomes. They show fixed example decisions. The current production receipt provides status but no reply form to satisfy a request for more information; treat that as a contribution-loop gap to address in design.

## Proposed tasks, not screenshots of existing features

- J2: from a displayed score, identify the original measure, assessor, observation period, exact report passage and conversion rule. The IPRE examples are comparator evidence, not PNA implementation scores.
- J6: submit an attributed alternative assessment or government response, inspect disagreement, and follow its disposition without overwriting another assessor's position.
- J7: follow an issue and return after a correction; identify why the assessment changed and which aggregate was affected.

Each external designer should use these same tasks and mark mock observations explicitly. A credible prototype must not silently turn the current planned indicators into observed results.
