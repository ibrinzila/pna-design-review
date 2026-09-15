import {editorial} from './editorial.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const sha=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export function moderator(request,env){const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email')?.toLowerCase();return id&&email&&(env.MODERATOR_EMAILS||'').toLowerCase().split(',').map(s=>s.trim()).includes(email)?id:null;}
async function body(request,limit=16000){if(Number(request.headers.get('content-length'))>limit)throw Error('too-large');const reader=request.body?.getReader();if(!reader)throw Error('bad-body');let size=0,chunks=[];while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw Error('too-large');}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}return JSON.parse(new TextDecoder().decode(bytes));}
const validId=s=>typeof s==='string'&&/^[a-z0-9-]{3,80}$/.test(s);
const bounded=(s,min,max)=>typeof s==='string'&&s.trim().length>=min&&s.length<=max;
function retryResult(existing,b,tokenHash){
 if(existing.receipt_hash!==tokenHash)return json({error:'Identificator deja folosit.'},409);
 if(existing.action_id!==b.actionId||existing.kind!==b.kind||existing.message!==b.message||existing.source_url!==b.sourceUrl)return json({error:'Contribuția inițială este deja salvată. Modificările noi nu au fost trimise. Păstrează recipisa și textul nou înainte de a reîncărca pagina.',received:true,id:b.id},409);
 return json({id:b.id,status:'received'},200);
}
export async function api(request,env){
 const url=new URL(request.url),path=url.pathname,actor=moderator(request,env);
 if(request.method==='POST'&&(request.headers.get('origin')!==url.origin||request.headers.get('content-type')?.split(';')[0]!=='application/json'))return json({error:'Cerere respinsă. Reîncarcă pagina și încearcă din nou.'},403);
 if(path==='/api/session')return json({moderator:!!actor});
 if(!env.DB)return json({error:'Contribuțiile sunt temporar indisponibile. Textul tău rămâne în formular.'},503);
 try{
 if(path==='/api/editorial'||path.startsWith('/api/editorial/'))return await editorial(request,env,actor,{json,body});
 if(path==='/api/contributions'&&request.method==='POST'){
  const b=await body(request);
  if(!validId(b.id)||!validId(b.actionId)||!bounded(b.token,48,128)||!['correction','evidence'].includes(b.kind)||!bounded(b.message,20,4000)||!bounded(b.sourceUrl,8,1500))return json({error:'Completează mesajul (20–4.000 de caractere) și o sursă HTTPS.'},400);
  let source;try{source=new URL(b.sourceUrl);}catch{return json({error:'Adresa sursei nu este validă.'},400);}
  if(source.protocol!=='https:'||source.username||source.password)return json({error:'Folosește o adresă HTTPS fără date de autentificare.'},400);
  const asset=await env.ASSETS.fetch(new Request(url.origin+'/records/'+b.actionId+'.json'));if(!asset.ok)return json({error:'Acțiunea nu a fost găsită.'},404);
  const tokenHash=await sha(b.token),existing=await env.DB.prepare('SELECT receipt_hash,action_id,kind,message,source_url FROM contributions WHERE id = ?').bind(b.id).first();
  if(existing)return retryResult(existing,b,tokenHash);
  if(!env.RATE_LIMIT_SALT)return json({error:'Primirea contribuțiilor nu este încă activată.'},503);
  const hour=Math.floor(Date.now()/3600000),ip=request.headers.get('cf-connecting-ip')||'unknown';const key=await sha(env.RATE_LIMIT_SALT+':'+ip+':'+hour);
  const quota=await env.DB.prepare('INSERT INTO submission_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<10 RETURNING count').bind(key,(hour+2)*3600000).first();
  if(!quota)return json({error:'Ai trimis mai multe contribuții într-un interval scurt. Păstrează textul și încearcă mai târziu.'},429);
  const now=new Date().toISOString();const saved=await env.DB.batch([
   env.DB.prepare('INSERT INTO contributions (id,action_id,kind,message,source_url,receipt_hash,status,created_at,version,test_record) VALUES (?,?,?,?,?,?,\'pending\',?,0,?) ON CONFLICT(id) DO NOTHING').bind(b.id,b.actionId,b.kind,b.message,b.sourceUrl,tokenHash,now,actor&&b.testRecord===true?1:0),
   env.DB.prepare('DELETE FROM submission_limits WHERE expires_at < ?').bind(Date.now())]);
  if(!saved[0].meta.changes){
   const concurrent=await env.DB.prepare('SELECT receipt_hash,action_id,kind,message,source_url FROM contributions WHERE id=?').bind(b.id).first();
   if(concurrent)return retryResult(concurrent,b,tokenHash);
   throw Error('Missing insert result');
  }
  return json({id:b.id,status:'received'},201);
 }
 const receipt=path.match(/^\/api\/receipt\/([a-z0-9-]{3,80})$/);
 if(receipt&&request.method==='GET'){
  const token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';const row=await env.DB.prepare('SELECT id,action_id,status,created_at,reviewed_at,decision,public_note,receipt_hash FROM contributions WHERE id=?').bind(receipt[1]).first();
  if(!row||!token||row.receipt_hash!==await sha(token))return json({error:'Recipisa nu a fost găsită sau cheia este incorectă.'},404);delete row.receipt_hash;return json(row);
 }
 if(path==='/api/public-contributions'&&request.method==='GET'){
  const actionId=url.searchParams.get('action');if(!validId(actionId))return json({error:'Acțiune invalidă.'},400);
  const rows=(await env.DB.prepare("SELECT id,kind,source_url,status,public_note,source_excerpt,reviewed_at FROM contributions c WHERE action_id=? AND test_record=0 AND EXISTS (SELECT 1 FROM review_events e WHERE e.contribution_id=c.id AND e.decision='accepted') ORDER BY reviewed_at DESC LIMIT 100").bind(actionId).all()).results;
  const events=(await env.DB.prepare("SELECT e.contribution_id,e.decision,e.public_note,e.source_excerpt,e.created_at,e.version FROM review_events e JOIN contributions c ON c.id=e.contribution_id WHERE c.action_id=? AND c.test_record=0 AND e.version >= (SELECT MIN(first.version) FROM review_events first WHERE first.contribution_id=c.id AND first.decision='accepted') ORDER BY e.version").bind(actionId).all()).results;
  return json(rows.map(row=>({...row,history:events.filter(event=>event.contribution_id===row.id)})));
 }
 if(path.startsWith('/api/review')){
  if(!actor)return json({error:'Acces rezervat responsabilului editorial.'},403);
  if(path==='/api/review'&&request.method==='GET')return json((await env.DB.prepare('SELECT id,action_id,kind,message,source_url,status,created_at,version,test_record,decision,public_note FROM contributions ORDER BY created_at DESC LIMIT 100').all()).results);
  if(path==='/api/review'&&request.method==='POST'){
   const b=await body(request);if(!validId(b.id)||!Number.isInteger(b.version)||!['accepted','rejected','needs-information'].includes(b.decision)||!bounded(b.reason,20,2000)||(b.decision==='accepted'&&(!bounded(b.publicNote,20,2000)||!bounded(b.sourceExcerpt,20,8000))))return json({error:'Include decizia motivată și, la acceptare, nota publică și citatul care o susține, fără date personale.'},400);
   const event=crypto.randomUUID(),now=new Date().toISOString();
   // Event is inserted only for the expected version, then the row update uses the same guard. D1 batch is atomic.
   const results=await env.DB.batch([
    env.DB.prepare('INSERT INTO review_events (id,contribution_id,actor_id,decision,reason,public_note,source_excerpt,created_at,version) SELECT ?,id,?,?,?,?,?,?,version+1 FROM contributions WHERE id=? AND version=?').bind(event,actor,b.decision,b.reason,b.publicNote||null,b.sourceExcerpt||null,now,b.id,b.version),
    env.DB.prepare('UPDATE contributions SET status=?,decision=?,public_note=?,source_excerpt=?,reviewer_id=?,reviewed_at=?,version=version+1 WHERE id=? AND version=?').bind(b.decision,b.reason,b.publicNote||null,b.sourceExcerpt||null,actor,now,b.id,b.version)]);
   if(!results[1].meta.changes)return json({error:'Fișa a fost schimbată între timp. Reîncarcă lista înainte de a decide.'},409);
   return json({saved:true,version:b.version+1});
  }
 }
 return json({error:'Resursă inexistentă.'},404);
 }catch(error){console.error('PNA request failed',error?.name||'Error');return json({error:'Nu am putut salva sau încărca datele. Păstrează textul și încearcă din nou.'},503);}
}
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname.startsWith('/api/'))return api(request,env);return env.ASSETS.fetch(request);}};
