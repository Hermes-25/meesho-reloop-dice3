import { sqliteTable, text, integer, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
export const comments=sqliteTable('review_comments',{
 id:text('id').primaryKey(), screen:text('screen').notNull(), name:text('name').notNull(),
 body:text('body').notNull(), context:text('context').notNull(), createdAt:integer('created_at').notNull(),
 rateKey:text('rate_key').notNull(),
 parentId:text('parent_id').references((): AnySQLiteColumn => comments.id),
 threadId:text('thread_id').references((): AnySQLiteColumn => comments.id)
},t=>[index('idx_comments_screen_created').on(t.screen,t.createdAt),index('idx_comments_rate_created').on(t.rateKey,t.createdAt),index('idx_comments_created').on(t.createdAt),index('idx_comments_thread_created').on(t.threadId,t.createdAt)]);
export const rooms=sqliteTable('demo_rooms',{id:text('id').primaryKey(),keyHash:text('key_hash').notNull(),state:text('state').notNull(),version:integer('version').notNull().default(1),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),rateKey:text('rate_key').notNull()},t=>[index('idx_demo_rooms_rate_created').on(t.rateKey,t.createdAt)]);
export const captures=sqliteTable('demo_captures',{tokenHash:text('token_hash').primaryKey(),roomId:text('room_id').notNull().references(()=>rooms.id),expiresAt:integer('expires_at').notNull()});
export const photos=sqliteTable('demo_photos',{id:text('id').primaryKey(),roomId:text('room_id').notNull().references(()=>rooms.id),slot:integer('slot').notNull(),objectKey:text('object_key').notNull(),mime:text('mime').notNull(),createdAt:integer('created_at').notNull()},t=>[index('idx_demo_photos_room_slot').on(t.roomId,t.slot,t.createdAt)]);
export const events=sqliteTable('demo_events',{id:text('id').primaryKey(),roomId:text('room_id').notNull().references(()=>rooms.id),version:integer('version').notNull(),actor:text('actor').notNull(),state:text('state').notNull(),createdAt:integer('created_at').notNull()},t=>[index('idx_demo_events_room_version').on(t.roomId,t.version)]);
export const appProfiles=sqliteTable('app_profiles',{id:text('id').primaryKey(),username:text('username').notNull().unique(),passwordHash:text('password_hash').notNull(),salt:text('salt').notNull(),recoveryHash:text('recovery_hash').notNull(),role:text('role').notNull(),business:text('business').notNull(),city:text('city').notNull(),createdAt:integer('created_at').notNull()});
export const appSessions=sqliteTable('app_sessions',{id:text('id').primaryKey(),userId:text('user_id').notNull().references(()=>appProfiles.id),expiresAt:integer('expires_at').notNull()},t=>[index('idx_app_session_expiry').on(t.expiresAt)]);
export const appMarket=sqliteTable('app_market',{id:text('id').primaryKey(),version:integer('version').notNull(),body:text('body').notNull()});
export const appLimits=sqliteTable('app_limits',{id:text('id').primaryKey(),count:integer('count').notNull()});
export const appPhotos=sqliteTable('app_photos',{id:text('id').primaryKey(),owner:text('owner').notNull().references(()=>appProfiles.id),objectKey:text('object_key').notNull(),digest:text('digest').notNull(),createdAt:integer('created_at').notNull()},t=>[index('idx_app_photo_owner_digest').on(t.owner,t.digest)]);
export const appDemoSessions=sqliteTable('app_demo_sessions',{id:text('id').primaryKey(),spaceId:text('space_id').notNull(),role:text('role').notNull(),expiresAt:integer('expires_at').notNull()},t=>[index('idx_app_demo_expiry').on(t.expiresAt)]);
export const appDemoPhotos=sqliteTable('app_demo_photos',{id:text('id').primaryKey(),spaceId:text('space_id').notNull(),owner:text('owner').notNull(),objectKey:text('object_key').notNull(),digest:text('digest').notNull(),createdAt:integer('created_at').notNull()},t=>[index('idx_app_demo_photo_space').on(t.spaceId)]);
