import {activePolicy,assessRevision} from './editorial-policy.js';
import {bundledItems,bundledRevision,bundledEvent,initialWrites} from './editorial-catalog.js';

const decisions = ['supported','needs-changes','unresolved'];
const bounded = (v,min,max) => typeof v==='string' && v.trim().length>=min && v.length<=max;
const parseRevision = row => ({...row,payload:JSON.parse(row.payload_json),payload_json:undefined});
const parseEvent = row => ({...row,claim_verdicts:JSON.parse(row.claim_verdicts_json),claim_verdicts_json:undefined});
const invalid = json => json({error:'Completează decizia, motivul și verificarea fiecărei afirmații.'},400);

async function current(db,id) {
  const row=await db.prepare('SELECT r.*,i.version,i.sample_group,i.batch_id FROM editorial_items i LEFT JOIN editorial_revisions r ON r.id=i.current_revision_id WHERE i.action_id=?').bind(id).first();
  if(row&&!row.id)throw Error('Missing editorial revision');
  return row ? parseRevision(row) : bundledRevision(id);
}
async function sourceRecord(env,origin,id) {
  const response=await env.ASSETS.fetch(new Request(origin+'/records/'+id+'.json'));
  return response.ok ? response.json() : null;
}
function validClaims(claims,source,revision) {
  // The offline import verifies citations against the hashed PDF. This pilot
  // allows wording edits only; changing a citation requires a new checked import.
  const key=e=>JSON.stringify([e.sourceId,e.sourceHash,e.page,e.quote.normalize('NFC').replace(/\s+/gu,' ').trim()]);
  const original=revision.payload.claims||[];
  const citations=new Map(original.map(c=>[c.id,c.evidence.map(key).sort()]));
  return Array.isArray(claims) && claims.length>0 && claims.length===original.length && claims.length<=32 && claims.every(c=>c && typeof c==='object') && new Set(claims.map(c=>c.id)).size===claims.length && claims.every(c=>
    citations.has(c.id) && bounded(c.id,1,150) && /^[a-zA-Z0-9:_-]+$/.test(c.id) && bounded(c.text,1,4000) && Array.isArray(c.evidence) && c.evidence.length>0 && c.evidence.length<=20 && c.evidence.every(e=>
      e && e.sourceId===source.sourceId && e.sourceHash===revision.source_hash && Number.isInteger(e.page) && e.page>=1 && e.page<=revision.payload.source.pages && bounded(e.quote,1,6000)) && JSON.stringify(c.evidence.map(key).sort())===JSON.stringify(citations.get(c.id)));
}
function validVerdicts(body,claims) {
  const verdicts=body.claimVerdicts;
  return decisions.includes(body.decision) && bounded(body.reason,20,4000) && Array.isArray(verdicts) && verdicts.length===claims.length && verdicts.every(v=>v && typeof v==='object') && new Set(verdicts.map(v=>v.claimId)).size===claims.length &&
    claims.every(c=>verdicts.some(v=>v.claimId===c.id && decisions.includes(v.decision))) &&
    (body.decision!=='supported' || (claims.length>0 && verdicts.every(v=>v.decision==='supported')));
}

export async function editorial(request,env,actor,{json,body}) {
  if(!actor)return json({error:'Acces rezervat responsabilului editorial.'},403);
  const url=new URL(request.url), db=env.DB;
  if(url.pathname==='/api/editorial' && request.method==='GET') {
    const rows=(await db.prepare('SELECT i.action_id,i.version,i.sample_group,i.batch_id,r.payload_json FROM editorial_items i JOIN editorial_revisions r ON r.id=i.current_revision_id ORDER BY i.action_id LIMIT 200').all()).results;
    const items=new Map(bundledItems().map(i=>[i.actionId,i]));
    for(const r of rows){const p=JSON.parse(r.payload_json);items.set(r.action_id,{actionId:r.action_id,version:r.version,sampleGroup:r.sample_group,batchId:r.batch_id,title:p.title,kind:p.kind||'explanation'});}
    return json({policy:activePolicy,publicationBlocked:true,items:[...items.values()]});
  }
  const match=url.pathname.match(/^\/api\/editorial\/([a-z0-9-]{3,80})(?:\/(reviews|revisions))?$/);
  if(!match)return json({error:'Fișa de revizuire nu a fost găsită.'},404);
  const id=match[1], operation=match[2], revision=await current(db,id);
  if(!revision)return json({error:'Fișa nu este inclusă în lotul curent.'},404);
  const source=await sourceRecord(env,url.origin,id);
  if(request.method==='GET' && !operation) {
    const allEvents=(await db.prepare('SELECT e.* FROM editorial_events e JOIN editorial_revisions r ON r.id=e.revision_id WHERE r.action_id=? ORDER BY e.created_at,e.sequence').bind(id).all()).results.map(parseEvent);
    if(revision.fromBundle){const event=bundledEvent(id);if(!allEvents.some(e=>e.id===event.id))allEvents.unshift(event);}
    const aiReviewHidden=revision.sample_group==='holdout' && !allEvents.some(e=>e.revision_id===revision.id && e.actor_type==='human' && e.actor_id===actor);
    const assessment=assessRevision(revision,allEvents,source);
    const history=(await db.prepare('SELECT id,parent_id,created_at FROM editorial_revisions WHERE action_id=? ORDER BY created_at').bind(id).all()).results;
    if(revision.fromBundle&&!history.some(r=>r.id===revision.id))history.unshift({id:revision.id,parent_id:null,created_at:revision.created_at});
    return json({version:revision.version,revision,history,events:allEvents.filter(e=>!aiReviewHidden || e.actor_type!=='ai').map(e=>({...e,actor_id:undefined,own:e.actor_id===actor})),aiReviewHidden,assessment:aiReviewHidden?{publishable:false,blockers:['independent-human-check-pending'],sourceChanged:assessment.blockers.includes('source-changed')}:assessment});
  }
  if(request.method!=='POST' || !operation)return json({error:'Metodă neacceptată.'},405);
  const b=await body(request,64000);
  if(!b || ['actorType','actorId','actor_type','actor_id','policyId','policyVersion'].some(k=>Object.hasOwn(b,k)))return invalid(json);
  if(revision.policy_id!==activePolicy.id || revision.policy_version!==activePolicy.version)return json({error:'Acest parcurs de revizuire nu este activ.'},409);
  const changed=!source || source.sourceHash!==revision.source_hash || ['changed','unavailable'].includes(source.sourceCurrency?.status);
  if(changed)return json({error:'Sursa s-a schimbat sau nu poate fi verificată. Păstrează notele; fișa trebuie reconciliată cu ediția actuală.'},409);
  if(operation==='reviews') {
    if(!bounded(b.id,10,80) || !/^[a-zA-Z0-9-]+$/.test(b.id) || !validVerdicts(b,revision.payload.claims||[]))return invalid(json);
    const existing=await db.prepare('SELECT * FROM editorial_events WHERE id=?').bind(b.id).first();
    const same=e=>e && e.revision_id===b.revisionId && e.actor_id===actor && e.actor_type==='human' && e.decision===b.decision && e.reason===b.reason && e.claim_verdicts_json===JSON.stringify(b.claimVerdicts);
    if(existing)return same(existing)?json({saved:true,alreadySaved:true,version:revision.version}):json({error:'Identificatorul aparține unei alte decizii. Păstrează notele și reîncarcă fișa.'},409);
    if(revision.author_id===actor)return json({error:'Autorul poate corecta fișa; verificarea independentă trebuie făcută de altă persoană.'},403);
    if(b.revisionId!==revision.id || b.version!==revision.version)return json({error:'Fișa a fost modificată între timp. Notele sunt păstrate; reîncarcă versiunea curentă înainte de decizie.'},409);
    const now=new Date().toISOString();
    const result=await db.batch([
      ...initialWrites(db,revision),
      db.prepare('INSERT INTO editorial_events (id,revision_id,actor_id,actor_type,decision,reason,claim_verdicts_json,created_at,sequence) SELECT ?,current_revision_id,?,\'human\',?,?,?,?,version+1 FROM editorial_items WHERE action_id=? AND version=? AND current_revision_id=?').bind(b.id,actor,b.decision,b.reason,JSON.stringify(b.claimVerdicts),now,id,b.version,b.revisionId),
      db.prepare('UPDATE editorial_items SET version=version+1 WHERE action_id=? AND version=? AND current_revision_id=?').bind(id,b.version,b.revisionId)
    ]);
    if(!result.at(-1).meta.changes){const retry=await db.prepare('SELECT * FROM editorial_events WHERE id=?').bind(b.id).first();return same(retry)?json({saved:true,alreadySaved:true,version:retry.sequence}):json({error:'Fișa a fost modificată între timp. Păstrează notele și reîncarcă versiunea curentă.'},409);}
    return json({saved:true,version:b.version+1});
  }
  if(b.revisionId!==revision.id || b.version!==revision.version)return json({error:'Fișa a fost modificată între timp. Păstrează textul și reîncarcă versiunea curentă.'},409);
  if(!bounded(b.title,3,300) || !bounded(b.explanation,20,12000) || !validClaims(b.claims,source,revision))return json({error:'Completează titlul, explicația și afirmațiile cu pasaje din aceeași copie PDF.'},400);
  const next=crypto.randomUUID(),now=new Date().toISOString();
  const payload={...revision.payload,title:b.title,explanation:b.explanation,claims:b.claims,kind:'explanation'};
  const result=await db.batch([
    ...initialWrites(db,revision),
    db.prepare('INSERT INTO editorial_revisions (id,action_id,parent_id,policy_id,policy_version,source_hash,edition_id,author_id,created_at,payload_json) SELECT ?,action_id,current_revision_id,?,?,?,?,?,?,? FROM editorial_items WHERE action_id=? AND version=? AND current_revision_id=?').bind(next,revision.policy_id,revision.policy_version,revision.source_hash,revision.edition_id,actor,now,JSON.stringify(payload),id,b.version,b.revisionId),
    db.prepare('UPDATE editorial_items SET current_revision_id=?,version=version+1 WHERE action_id=? AND version=? AND current_revision_id=?').bind(next,id,b.version,b.revisionId)
  ]);
  return result.at(-1).meta.changes?json({saved:true,revisionId:next,version:b.version+1}):json({error:'Fișa s-a schimbat. Păstrează textul și reîncarcă înainte de salvare.'},409);
}
