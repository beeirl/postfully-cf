import { jsonb, pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { id, ids, timestamps } from '../database/types'

export const VideoTable = pgTable('video', {
  ...ids,
  ...timestamps,
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  fileID: id('file_id'),
  backgroundFileID: id('background_file_id'),
  musicFileID: id('music_file_id'),
  speechFileID: id('speech_file_id'),
  templateID: id('template_id'),
  settings: jsonb('settings').notNull(),
})

const VideoRenderStatus = ['pending', 'processing', 'completed', 'failed'] as const

export const VideoRenderTable = pgTable(
  'video_render',
  {
    ...ids,
    ...timestamps,
    videoID: id('video_id').notNull(),
    remotionRenderID: varchar('remotion_render_id', { length: 255 }).notNull(),
    status: pgEnum('status', VideoRenderStatus)(),
  },
  (table) => [],
)
