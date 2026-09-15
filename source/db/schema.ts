import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const contributions=sqliteTable('contributions',{
 id:text('id').primaryKey(),actionId:text('action_id').notNull(),kind:text('kind').notNull(),message:text('message').notNull(),sourceUrl:text('source_url').notNull(),receiptHash:text('receipt_hash').notNull(),status:text('status').notNull().default('pending'),createdAt:text('created_at').notNull(),reviewedAt:text('reviewed_at'),reviewerId:text('reviewer_id'),decision:text('decision'),publicNote:text('public_note'),sourceExcerpt:text('source_excerpt'),version:integer('version').notNull().default(0),testRecord:integer('test_record').notNull().default(0)
},t=>[index('idx_contributions_action_status').on(t.actionId,t.status),index('idx_contributions_status_created').on(t.status,t.createdAt)]);
export const reviewEvents=sqliteTable('review_events',{id:text('id').primaryKey(),contributionId:text('contribution_id').notNull(),actorId:text('actor_id').notNull(),decision:text('decision').notNull(),reason:text('reason').notNull(),publicNote:text('public_note'),sourceExcerpt:text('source_excerpt'),createdAt:text('created_at').notNull(),version:integer('version').notNull()},t=>[index('idx_events_contribution').on(t.contributionId,t.version)]);
export const submissionLimits=sqliteTable('submission_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),expiresAt:integer('expires_at').notNull()});
export const editorialItems=sqliteTable('editorial_items',{
 actionId:text('action_id').primaryKey(),currentRevisionId:text('current_revision_id').notNull(),batchId:text('batch_id').notNull(),sampleGroup:text('sample_group').notNull(),version:integer('version').notNull().default(0)
},t=>[index('idx_editorial_items_batch').on(t.batchId,t.actionId)]);
export const editorialRevisions=sqliteTable('editorial_revisions',{
 id:text('id').primaryKey(),actionId:text('action_id').notNull(),parentId:text('parent_id'),policyId:text('policy_id').notNull(),policyVersion:integer('policy_version').notNull(),sourceHash:text('source_hash').notNull(),editionId:text('edition_id').notNull(),authorId:text('author_id').notNull(),createdAt:text('created_at').notNull(),payloadJson:text('payload_json').notNull()
},t=>[index('idx_editorial_revisions_action').on(t.actionId,t.createdAt)]);
export const editorialEvents=sqliteTable('editorial_events',{
 id:text('id').primaryKey(),revisionId:text('revision_id').notNull(),actorId:text('actor_id').notNull(),actorType:text('actor_type').notNull(),decision:text('decision').notNull(),reason:text('reason').notNull(),claimVerdictsJson:text('claim_verdicts_json').notNull(),createdAt:text('created_at').notNull(),sequence:integer('sequence').notNull()
},t=>[index('idx_editorial_events_revision').on(t.revisionId,t.sequence)]);
