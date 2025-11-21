import { sql } from 'drizzle-orm'
import { timestamp as pgTimestamp, varchar } from 'drizzle-orm/pg-core'

export const id = (name: string) => varchar(name, { length: 30 })

export const ids = {
  get id() {
    return id('id').notNull()
  },
  get workspaceID() {
    return id('workspace_id').notNull()
  },
}

export const timestamp = (name: string) => pgTimestamp(name, { withTimezone: true })

export const timestamps = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  archivedAt: timestamp('archived_at'),
}
