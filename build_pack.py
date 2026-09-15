"""Render this fixed review packet and its manifest without external dependencies."""
import hashlib, html, json, re, zipfile
from pathlib import Path

P=Path(__file__).resolve().parent
PUBLIC='https://pna.md/design-review/2026-09-15/'
REPOSITORY='https://github.com/ibrinzila/pna-design-review'
E=html.escape

def inline(text):
    text=E(text)
    text=re.sub(r'\[([^\]]+)\]\(([^ )]+)\)',lambda m:'<a href="'+(re.sub(r'\.md(?=#|$)','.html',m[2]) if not m[2].startswith('https://') else m[2])+'">'+m[1]+'</a>',text)
    text=re.sub(r'`([^`]+)`',r'<code>\1</code>',text)
    text=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',text)
    return text

def render_md(text):
    # Deliberately limited to this packet's trusted headings, paragraphs, lists and tables.
    lines=text.splitlines();out=[];i=0
    while i<len(lines):
        line=lines[i].strip()
        if not line:i+=1;continue
        if line.startswith('#'):
            level=len(line)-len(line.lstrip('#'));out.append(f'<h{level}>'+inline(line[level:].strip())+f'</h{level}>');i+=1
        elif line.startswith('|'):
            table=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                cells=lines[i].strip().strip('|').split('|')
                if not all(re.fullmatch(r'[\s:-]+',c) for c in cells):table.append(cells)
                i+=1
            out.append('<div class="table-wrap" tabindex="0" aria-label="Scrollable comparison table"><table>')
            for row,cells in enumerate(table):
                tag='th' if row==0 else 'td';out.append('<tr>'+''.join(f'<{tag}>'+inline(c.strip())+f'</{tag}>' for c in cells)+'</tr>')
            out.append('</table></div>')
        elif re.match(r'(- |\d+\. )',line):
            ordered=bool(re.match(r'\d+\. ',line));tag='ol' if ordered else 'ul';out.append('<'+tag+'>')
            while i<len(lines) and re.match(r'(- |\d+\. )',lines[i].strip()):
                out.append('<li>'+inline(re.sub(r'^(- |\d+\. )','',lines[i].strip()))+'</li>');i+=1
            out.append('</'+tag+'>')
        else:
            para=[line];i+=1
            while i<len(lines) and lines[i].strip() and not re.match(r'(#|\||- |\d+\. )',lines[i].strip()):para.append(lines[i].strip());i+=1
            out.append('<p>'+inline(' '.join(para))+'</p>')
    return '\n'.join(out)

def page(title,body):
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+E(title)+' · PNA design review</title><link rel="stylesheet" href="pack.css"></head><body><a class="skip" href="#main">Skip to content</a><header><a class="brand" href="index.html">pna<span>/</span>eu</a><span>Public design review · 15 September 2026</span><a href="https://pna.md/">Current product ↗</a></header><main id="main">'+body+'</main><footer>Frozen evidence and a synthetic demonstration. Independent civic initiative; no government endorsement. <a href="README.html">Scope &amp; reproducibility</a></footer></body></html>'

for md in sorted(P.glob('*.md')):
    (md.with_suffix('.html')).write_text(page(md.stem, '<p><a href="index.html">← Review pack</a> · <a href="'+md.name+'">Markdown source</a></p><article>'+render_md(md.read_text())+'</article>'))

manifest=json.loads((P/'screen-manifest.json').read_text())
gallery=[]
for item in manifest:
    item['replayUrl']=item['url'].replace('http://127.0.0.1:8794/',PUBLIC)
    gallery.append('<figure id="'+E(item['id'])+'"><a href="'+E(item['screenshot'])+'"><img loading="lazy" src="'+E(item['screenshot'])+'" alt="'+E(item['task'])+'"></a><figcaption><strong>'+E(item['id'].replace('-',' '))+'</strong><p>'+E(item['task'])+'</p><small>'+E(item['tier'])+' · '+E(item.get('captureMode','full-page'))+' · '+str(item['viewport']['width'])+' × '+str(item['viewport']['height'])+' CSS px</small><p><a href="'+E(item['screenshot'])+'">Full screen</a> · <a href="'+E(item['snapshot'])+'">DOM text</a> · <a href="'+E(item['replayUrl'])+'">Open start</a></p></figcaption></figure>')
(P/'screen-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(P/'screens.html').write_text(page('Frozen screen library','<h1>See the current product.</h1><p>'+str(len(manifest))+' saved states across route families and workflows. Each image has a DOM snapshot, capture URL and actual viewport. A start link may require the steps in the <a href="WORKFLOW-COVERAGE.html">replay guide</a> to reach a saved or error state.</p><p>These are observations and labeled demonstrations. Tracking, authority response and following remain proposed.</p><div class="gallery">'+''.join(gallery)+'</div>'))
documents=json.loads((P/'document-manifest.json').read_text())
(P/'documents.html').write_text(page('Original demonstration documents','<h1>The sources behind the three cases.</h1><p>Unmodified public PDFs and rendered pages from the captured edition. These are source documents, not proposed interface mockups. Their legal correspondence remains subject to verification.</p>'+''.join('<section><h2>'+E(d['actionId'])+' · page '+str(d['page'])+'</h2><p><a href="'+d['file']+'">Retained original PDF</a> · <a href="'+d['pageImage']+'">Full-size page image</a> · <a href="'+E(d['originalUrl'])+'">Original publisher URL</a></p><p><code>SHA-256 '+d['sha256']+'</code></p><img style="width:100%;height:auto" src="'+d['pageImage']+'" alt="Original table page for '+d['actionId']+'"></section>' for d in documents)))

receipt='#id=demo-contribution&token=demo-key-public-example'
scenarios=[('Start with a real public target','editorial.html#demo-26-b-22-2026-09-10','Review the youth-centres target, citations and decision form.'),('Inspect conflicting fields','editorial.html#demo-27-b-9-2026-09-10','Compare the public wastewater wording with its extracted indicator.'),('Inspect an extraction gap','editorial.html#demo-20-b-20-2026-09-10','See why missing text must remain an explicit uncertainty.'),('Recover stale work','editorial.html?state=stale#demo-26-b-22-2026-09-10','The first save fails. Reload the record with notes retained, then retry.'),('Failed save','editorial.html?state=unavailable#demo-26-b-22-2026-09-10','Try saving and inspect the retained draft.'),('No editorial access','editorial.html?state=denied','Inspect the restricted-role state without signing in.'),('Empty editorial queue','editorial.html?state=empty','Inspect the no-records state.'),('Citizen contribution','action.html','Submit a sample source-linked correction and open its synthetic receipt.'),('Moderation workspace','moderation.html','Inspect the current decision form with a simulated editor role.'),('Moderation access denied','moderation.html?state=denied','Check the same role boundary for contribution moderation.')]
scenarios += [('Receipt: '+label,'receipt.html?state='+state+receipt,'A fixed sample decision; no real contributor or saved submission.') for state,label in [('pending','pending'),('needs-information','more information needed'),('rejected','not accepted'),('accepted','accepted')]]
scenarios += [('Missing or incorrect receipt key','receipt.html?state=missing','No private sample is shown without the expected example key.')]
cards=''.join('<a class="card" href="demo/'+E(url)+'"><strong>'+E(title)+'</strong><p>'+E(desc)+'</p></a>' for title,url,desc in scenarios)

body='''<section class="hero"><p class="eyebrow">The design question</p><h1>From reading a plan<br>to acting on evidence.</h1><p class="lead">How should PNA help someone verify a claim, challenge it with evidence, receive a reasoned response, and follow what changes?</p><p>This packet opens the current product to independent assessment. It includes frozen screens, public cases and an isolated demonstration of the editorial workflow.</p><div class="actions"><a class="button" href="CLAUDE-PROMPT.html">Start the design review</a><a class="button secondary" href="#demo">Try the demonstration</a><a href="pna-design-review-2026-09-15.zip">Download the complete pack</a></div></section>
<nav class="contents" aria-label="Packet sections"><a href="#truth">Current truth</a><a href="#brief">Read the brief</a><a href="#demo">Try the workflows</a><a href="screens.html">Frozen screens</a><a href="#handoff">Handoff</a></nav>
<section id="truth"><p class="eyebrow">What exists / what is missing</p><h2>A source-linked catalogue and review foundation.</h2><div class="facts"><div><b>2,779</b> indexed action records</div><div><b>105</b> source documents</div><div><b>24</b> AI-reviewed public explanations</div><div><b>0</b> actions with an implementation assessment</div></div><p>The current product supports finding, reading, citing and submitting evidence. Typed assessments, traceable calculations, organisational responses and follow-up are still missing. AI review is separate from human acceptance, legal-source verification and implementation.</p><div class="flow" aria-label="Intended user journey"><span>Understand<br><small>current foundation</small></span><span>Inspect sources<br><small>current foundation</small></span><span>Contribute<br><small>current foundation</small></span><span>Resolve &amp; assess<br><small>incomplete / proposed</small></span><span>Follow change<br><small>proposed</small></span></div><p><a href="DESIGN-REVIEW.html">Read the ranked findings and their evidence →</a></p></section>
<section id="brief"><p class="eyebrow">Give the reviewer the problem, not just the pixels</p><h2>Six roles. Seven common journeys.</h2><p>Citizens, journalists and researchers, shadow-report teams, government partners, editors and returning followers need different actions and authority. These are provisional roles to test, not completed user research.</p><div class="cards"><a class="card" href="REVIEW-BRIEF.html"><strong>Mission, people and outcomes</strong><p>The product argument, constraints, seven journeys and proposal acceptance questions.</p></a><a class="card" href="DESIGN-REVIEW.html"><strong>Current gaps and three directions</strong><p>Extend existing pages, test an evidence-linked case workspace, or reorganise more broadly.</p></a><a class="card" href="RESEARCH.html"><strong>IPRE and international comparisons</strong><p>Two different trackers, a traced score, explicit assessment methods, response windows and provenance.</p></a><a class="card" href="WORKFLOW-COVERAGE.html"><strong>What each walkthrough proves</strong><p>Repeatable tasks, recovery steps and capabilities that remain absent.</p></a></div></section>
<section id="demo"><p class="eyebrow">Public-source demonstration · no account needed</p><h2>Walk through the current review experience.</h2><p class="notice"><strong>All decisions here are simulated.</strong> Nothing is submitted to PNA, and saves disappear when the page reloads. Sample receipts use a public example key. The actual reviewer workspace remains private. The embedded PDF works in the Brave capture browser; the in-app browser showed a blank viewer.</p><div class="cards">'''+cards+'''</div><p><a href="screens.html">Prefer fixed screens? Open the complete gallery →</a></p></section>
<section id="handoff"><p class="eyebrow">A portable handoff</p><h2>Give Claude Design the same evidence you have.</h2><ol><li>Share this page and the public code reference.</li><li>Attach the ZIP when the tool supports file import.</li><li>Paste the review prompt. Ask it to report any material it cannot access.</li></ol><p>Request an evidence-backed assessment first, then three comparable directions using the same cases. A full redesign and a focused overlay are both open; preserving source fidelity, privacy and decision history is part of the task.</p><div class="actions"><a class="button" href="CLAUDE-PROMPT.html">Open the copy-ready prompt</a><a href="'''+REPOSITORY+'''">GitHub reference ↗</a><a href="pna-design-review-2026-09-15.zip">Download ZIP</a></div><p><a href="README.html">Scope and reproducibility</a> · <a href="screen-manifest.json">Screen manifest</a> · <a href="source-manifest.json">Code provenance</a> · <a href="checksums.json">File hashes</a> · <a href="STATUS.html">Status and limits</a></p></section>'''
body=body.replace('<a href="screen-manifest.json">Screen manifest</a>','<a href="documents.html">Original case documents</a> · <a href="screen-manifest.json">Screen manifest</a>')
body=body.replace('The embedded PDF works in the Brave capture browser; the in-app browser showed a blank viewer.','The embedded PDF works in the Brave capture browser; the in-app browser showed a blank viewer. <a href="documents.html">Open the retained PDFs and readable page images.</a>')
(P/'index.html').write_text(page('Public review pack',body))

files=[p for p in sorted(P.rglob('*')) if p.is_file() and p.name not in {'checksums.json','pna-design-review-2026-09-15.zip','pna-design-review-2026-09-15.zip.sha256'} and '__pycache__' not in p.parts]
hashes={str(p.relative_to(P)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
(P/'checksums.json').write_text(json.dumps(hashes,indent=2)+'\n')
archive=P/'pna-design-review-2026-09-15.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for f in files+[P/'checksums.json']:z.write(f,str(f.relative_to(P)))
(P/(archive.name+'.sha256')).write_text(hashlib.sha256(archive.read_bytes()).hexdigest()+'  '+archive.name+'\n')
print('Rendered public packet:',len(manifest),'screens;',len(files),'files;',archive.stat().st_size,'archive bytes.')
