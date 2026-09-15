// A presentation fixture, not a second backend. No network fallback or storage.
export function createDemoApi(input, scenario='ready',role='editor') {
 const data=structuredClone(input);let stale=scenario==='stale';
 const result=(value,status=200)=>Response.json(value,{status});
 const reject=()=>result({error:'Demonstrația nu poate accesa această resursă.'},403);
 return async function demoFetch(path,options={}) {
  if(typeof path!=='string'||!path.startsWith('/api/')||path.includes('://'))return reject();
  const method=options.method||'GET';let body={};
  try{if(options.body)body=JSON.parse(options.body);}catch{return reject();}
  const editor=role==='editor'&&scenario!=='denied';
  if(path==='/api/session')return result({moderator:editor,demonstration:true});
  if(path.startsWith('/api/editorial')) {
   if(!editor)return result({error:'Acces rezervat responsabilului editorial. În demonstrație, alege scenariul cu rol editor simulat.'},403);
   if(path==='/api/editorial')return result({items:scenario==='empty'?[]:data.items,publicationBlocked:true});
   const match=path.match(/^\/api\/editorial\/([a-z0-9-]+)(?:\/(reviews|revisions))?$/);
   if(!match||!data.records[match[1]])return reject();
   const record=data.records[match[1]],operation=match[2];
   if(method==='GET'&&!operation)return result(record);
   if(method!=='POST'||!operation)return reject();
   if(scenario==='unavailable')return result({error:'Salvarea este indisponibilă în acest scenariu demonstrativ. Textul rămâne în formular.'},503);
   if(stale){stale=false;record.version++;return result({error:'Fișa a fost modificată între timp. Notele sunt păstrate; reîncarcă versiunea curentă înainte de decizie.'},409);}
   if(body.version!==record.version||body.revisionId!==record.revision.id)return result({error:'Versiune veche. Reîncarcă fișa și păstrează notele.'},409);
   if(operation==='reviews') {
    if(record.aiReviewHidden)record.events.push({actor_type:'ai',revision_id:record.revision.id,decision:'unresolved',reason:'EXEMPLU demonstrativ: verdict AI simulat pentru a arăta comparația. Nu reprezintă o analiză a sursei.',created_at:'2026-09-15T09:00:00Z'});
    record.events.push({actor_type:'human',revision_id:record.revision.id,decision:body.decision,reason:body.reason,created_at:'2026-09-15T09:00:00Z'});
    record.aiReviewHidden=false;
   }else{
    record.revision={...record.revision,id:'demo-revision-'+(record.version+1),payload:{...record.revision.payload,title:body.title,explanation:body.explanation,claims:body.claims}};
    record.history.push({id:record.revision.id,created_at:'2026-09-15T09:00:00Z'});
   }
   record.version++;return result({saved:true,version:record.version,revisionId:record.revision.id,demonstration:true});
  }
  if(path==='/api/contributions'&&method==='POST')return result({id:body.id,status:'received',demonstration:true});
  if(path.startsWith('/api/receipt/')&&method==='GET')return scenario==='missing'||path!=='/api/receipt/demo-contribution'||new Headers(options.headers).get('Authorization')!=='Bearer demo-key-public-example'?result({error:'Recipisa nu a fost găsită sau cheia este incorectă.'},404):result({...data.contribution,status:['accepted','rejected','needs-information'].includes(scenario)?scenario:'pending',decision:({accepted:'EXEMPLU: observația a fost acceptată în această demonstrație.',rejected:'EXEMPLU: observația nu susține corectura propusă.', 'needs-information':'EXEMPLU: verificarea cere context suplimentar.'})[scenario]||null});
  if(path.startsWith('/api/public-contributions?')&&method==='GET')return result(scenario==='accepted'?[{...data.contribution,status:'accepted',public_note:'EXEMPLU demonstrativ: sursa descrie ținta planificată; nu dovedește realizarea.',source_excerpt:data.contribution.source_excerpt,history:[]}]:[]);
  if(path==='/api/review'&&!editor)return result({error:'Acces rezervat responsabilului editorial. Rolul editor nu este activ în acest scenariu.'},403);
  if(path==='/api/review'&&method==='GET')return result([{...data.contribution,status:'pending',version:0,test_record:true}]);
  if(path==='/api/review'&&method==='POST')return result({saved:true,version:1,demonstration:true});
  return reject();
 };
}
