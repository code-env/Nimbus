import { boolean, foreignKey, index, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

const defaultTimestamp = (name: string) => timestamp(name)
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull();

// Auth schema
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	defaultProviderId: text("default_provider_id"),
	defaultAccountId: text("default_account_id"),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(() => /* @__PURE__ */ new Date()),
	updatedAt: timestamp("updated_at").$defaultFn(() => /* @__PURE__ */ new Date()),
});

export const session = pgTable("session", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  token: text().notNull(),
  expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: defaultTimestamp("created_at"),
  updatedAt: defaultTimestamp("updated_at"),
}, (table) => [
  foreignKey({
  		columns: [table.userId],
  		foreignColumns: [user.id],
  		name: "session_user_id_user_id_fk"
  	}).onDelete("cascade"),
  unique("session_token_unique").on(table.token),
]);

export const account = pgTable("account", {
  id: text().primaryKey().notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
  scope: text(),
  password: text(),
  createdAt: defaultTimestamp("created_at"),
  updatedAt: defaultTimestamp("updated_at"),
  nickname: text(),
  // S3 Provider fields
  s3AccessKeyId: text("s3_access_key_id"),
  s3SecretAccessKey: text("s3_secret_access_key"),
  s3Region: text("s3_region"),
  s3BucketName: text("s3_bucket_name"),
  s3Endpoint: text("s3_endpoint"),
}, (table) => [
  index("account_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
  foreignKey({
  		columns: [table.userId],
  		foreignColumns: [user.id],
  		name: "account_user_id_user_id_fk"
  	}).onDelete("cascade"),
]);

// Tags schema
export const tag = pgTable("tag", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  color: text().default('#808080').notNull(), // Default grey color
  parentId: text("parent_id"),
  userId: text("user_id").notNull(),
  createdAt: defaultTimestamp("created_at"),
  updatedAt: defaultTimestamp("updated_at"),
}, (table) => [
  foreignKey({
  		columns: [table.parentId],
  		foreignColumns: [table.id],
  		name: "tag_parent_id_tag_id_fk"
  	}).onDelete("cascade"),
  foreignKey({
  		columns: [table.userId],
  		foreignColumns: [user.id],
  		name: "tag_user_id_user_id_fk"
  	}).onDelete("cascade"),
]);

// File-Tags junction table for many-to-many relationship
export const fileTag = pgTable("file_tag", {
  // Can't use foreign key here since we don't store all files locally(example: external files from cloud providers)
  id: text().primaryKey().notNull(),
  fileId: text("file_id").notNull(),
  tagId: text("tag_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: defaultTimestamp("created_at"),
}, (table) => [
  foreignKey({
  		columns: [table.tagId],
  		foreignColumns: [tag.id],
  		name: "file_tag_tag_id_tag_id_fk"
  	}).onDelete("cascade"),
  foreignKey({
  		columns: [table.userId],
  		foreignColumns: [user.id],
  		name: "file_tag_user_id_user_id_fk"
  	}).onDelete("cascade"),
]);

// Pinned Files schema
export const pinnedFile = pgTable("pinned_file", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  fileId: text("file_id").notNull(),
  name: text().notNull(),
  type: text().default('folder').notNull(),
  mimeType: text("mime_type"),
  provider: text().notNull(),
  accountId: text("account_id").notNull(),
  createdAt: defaultTimestamp("created_at"),
  updatedAt: defaultTimestamp("updated_at"),
}, (table) => [
  foreignKey({
  		columns: [table.userId],
  		foreignColumns: [user.id],
  		name: "pinned_file_user_id_user_id_fk"
  	}).onDelete("cascade"),
]);

// Waitlist Schema
export const waitlist = pgTable("waitlist", {
  id: text().primaryKey().notNull(),
  email: text().notNull(),
  createdAt: defaultTimestamp("created_at"),
}, (table) => [
  unique("waitlist_email_unique").on(table.email),
]);

// Rate Limiting Schema
export const rateLimitAttempts = pgTable("rate_limit_attempts", {
  identifier: text().primaryKey().notNull(), // e.g., IP address
  count: integer().default(1).notNull(),
  expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
});

const schema = {
  user,
  session,
  account,
  verification,
  tag,
  fileTag,
  pinnedFile,
  waitlist,
  rateLimitAttempts,
};

export type UserTableInsert = typeof user.$inferInsert;
export type UserTableSelect = typeof user.$inferSelect;
export type SessionTableInsert = typeof session.$inferInsert;
export type AccountTableSelect = typeof account.$inferSelect;
export type PinnedFileTableSelect = typeof pinnedFile.$inferSelect;

export default schema;
