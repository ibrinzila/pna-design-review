// Policy IDs belong to revisions, never to a mutable global review label.
export const activePolicy = Object.freeze({id:'calibrated-ai', version:1});
export const futurePolicies = Object.freeze(['expert-desk','chapter-specialist']);

export function assessRevision(revision, events, source) {
  const blockers = ['human-calibration-pending', 'legal-correspondence-unresolved'];
  if (revision.policy_id !== activePolicy.id || revision.policy_version !== activePolicy.version) blockers.push('policy-disabled');
  if (!source || source.sourceHash !== revision.source_hash || ['changed','unavailable'].includes(source.sourceCurrency?.status)) blockers.push('source-changed');
  const claims = revision.payload.claims || [];
  if (!claims.length || !revision.payload.explanation) blockers.push('explanation-incomplete');
  const latest = new Map();
  for (const event of [...events].sort((a,b)=>a.sequence-b.sequence)) {
    if (event.revision_id === revision.id && event.actor_id !== revision.author_id) latest.set(event.actor_type+':'+event.actor_id,event);
  }
  const decisions = [...latest.values()];
  const passes = event => event.decision === 'supported' && Boolean(revision.payload.explanation) && claims.length > 0 && claims.every(claim => event.claim_verdicts?.find(v=>v.claimId===claim.id)?.decision === 'supported');
  const aiReviewed = decisions.some(e=>e.actor_type==='ai' && passes(e));
  const humanReviewed = decisions.some(e=>e.actor_type==='human' && passes(e));
  if (!aiReviewed) blockers.push('independent-ai-review-pending');
  if (decisions.some(e=>!passes(e))) blockers.push('unresolved-review');
  if (!humanReviewed) blockers.push('human-review-pending');
  // This initial pilot records evidence; it has no automatic publication path.
  return {aiReviewed,humanReviewed,blockers,publishable:false};
}
