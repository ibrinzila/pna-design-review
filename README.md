# PNA public design-review pack

Prepared on 15 September 2026 for an independent assessment of PNA.md. Start with the [online pack](https://pna.md/design-review/2026-09-15/) and the [design brief](REVIEW-BRIEF.md). The [copy-ready prompt](CLAUDE-PROMPT.md) asks for a reasoned assessment before proposals.

## What is here

- Mission, intended outcomes, six provisional user roles and seven common test journeys.
- A ranked design review, primary-source comparison research and explicit missing capabilities.
- Frozen desktop and mobile screens, corresponding DOM text, capture URLs and viewport measurements in `screen-manifest.json`.
- An isolated demonstration of the current contribution and editorial interfaces using three public-source records.
- Selected current application modules and their hashes in `source-manifest.json`.
- Three retained original PDFs and page images, with publisher URLs and hashes in `document-manifest.json`.
- A [workflow coverage and replay guide](WORKFLOW-COVERAGE.md), including states that remain proposed.

This public repository is a design reference, not the complete production application. The private pilot dataset, production database, user identities, private receipt keys, credentials and configuration are excluded. Selected server modules refer to excluded files and cannot run as a complete backend. The original production history has not been copied into this repository.

## Start the demonstration

The hosted demonstration needs no account. Choose a case from the online pack. It runs the current interface with a browser-memory fixture adapter; network API calls and native form submissions are blocked by its Content Security Policy. Public original-document links remain available. Every save is synthetic and disappears on reload. There is no connection to the production review queue.

To run a downloaded copy, serve this directory with `python3 -m http.server 8794` and open `http://127.0.0.1:8794/`. Opening HTML directly as a file will not reliably load JavaScript modules. Public PDF links require a network connection and browser PDF support. The embedded PDF rendered in the Brave capture browser but was blank in the Codex in-app browser. The full-page PDF link and retained page images remain the fallback; viewer behavior is browser-dependent.

The contribution demonstration uses the public example identifier `demo-contribution` and the visibly synthetic key `demo-key-public-example`. They grant access only to a fixed sample, never a real contribution. Receipt URLs retain this fragment; an absent or incorrect key produces an error. Editorial pages simulate an editor role, while denied scenarios simulate no editorial access. Saves do not persist between pages. A receipt's state is selected explicitly for design inspection; it is not an end-to-end storage test.

The demonstration copies the current rendering code. Its contribution script has two documented presentation substitutions: a fixed synthetic receipt identifier/key, and wording that names the simulated editor instead of claiming a real signed-in identity. The separate adapter and banner provide the remaining isolation and state selection. Production modules in `source/` remain the unchanged reference.

## Reproducibility and evidence limits

The application baseline is the public release observed before this pack, source revision `216aa1b5ce42e5b13d1e3d998c17ba1c4e0402d6`. The audit covered route families and selected material states, not 2,779 separate action pages. Captures record actual CSS viewport dimensions. The capture mode identifies full-page images versus first-viewport images for long repeating lists; complete DOM text accompanies both. Mobile captures are narrow-layout checks, not a physical-device usability study.

Frozen PNGs and DOM snapshots are the exact saved observations. Demo scenarios reset predictably; fonts, external PDFs, live source websites and browser rendering may change. For saved/error states, follow the explicit steps in the coverage guide. `checksums.json` identifies each frozen file; the downloadable ZIP excludes itself and can be checked with its adjacent SHA-256 file.

Primary workflow checks used the in-app browser. Final screenshots were recaptured through Brave after image-scaling artifacts were found in the in-app capture. Public captures contain no private queue contents or actual reviewer notes. The demo supplies an explicit simulated citizen/editor distinction. These captures are not a controlled fresh-user usability study.

## Hand off to Claude Design or another reviewer

Provide the online pack and public repository, attach the ZIP when file import is available, and paste `CLAUDE-PROMPT.md`. Ask the reviewer to list any material it could not access. A connected codebase, uploaded screens and a walkthrough are complementary inputs; none guarantees that an external tool can inspect every interaction. See [Claude's design-system setup guidance](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design).

The same brief is suitable for other designers. No message has been sent to an external reviewer by this pack. Proposed tracking paths, research assumptions and synthetic decisions must remain labeled in subsequent concepts.

## Rights and attribution

PNA reference code and this review brief are supplied for the requested design assessment. Original documents and comparator screenshots retain their source attribution and applicable rights. Their inclusion is evidence for a bounded critique, not a claim of ownership or an endorsement by their publishers.
