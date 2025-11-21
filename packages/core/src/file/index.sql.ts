import { bigint, boolean, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core'
import { ids, timestamps } from '../database/types'
import { id } from '../database/types'

export const fileTable = pgTable(
  'file',
  {
    ...ids,
    ...timestamps,
    contentType: varchar('content_type', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    public: boolean('public').notNull(),
    size: bigint('size', { mode: 'number' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.workspaceID, table.id] })],
)

export const fileUploadTable = pgTable(
  'file_upload',
  {
    ...timestamps,
    contentType: varchar('content_type', { length: 255 }).notNull(),
    fileID: id('file_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    workspaceID: id('workspace_id').notNull(),
    public: boolean('public').notNull(),
    size: bigint('size', { mode: 'number' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.workspaceID, table.fileID] })],
)
