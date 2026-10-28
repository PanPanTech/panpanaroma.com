// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const inquiries = sqliteTable('inquiries', {
 id:text('id').primaryKey(), reference:text('reference').notNull().unique(), kind:text('kind').notNull(),
 name:text('name').notNull(),company:text('company').notNull(),email:text('email').notNull(),country:text('country').notNull(),
 product:text('product').notNull(),quantity:text('quantity').notNull(),packaging:text('packaging').notNull(),customization:text('customization').notNull(),
 timeline:text('timeline').notNull(),message:text('message').notNull(),source:text('source').notNull(),status:text('status').notNull().default('new'),
 isTest:integer('is_test').notNull().default(0),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
});
export const events = sqliteTable('events',{id:text('id').primaryKey(),kind:text('kind').notNull(),page:text('page').notNull(),product:text('product').notNull(),createdAt:text('created_at').notNull()});
