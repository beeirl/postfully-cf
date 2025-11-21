import { jsonb, pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { id, workspaceColumns, timestampColumns, workspaceIndexes } from '../database/types'

export const VideoTable = pgTable(
  'video',
  {
    ...workspaceColumns,
    ...timestampColumns,
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    fileID: id('file_id'),
    backgroundFileID: id('background_file_id'),
    musicFileID: id('music_file_id'),
    speechFileID: id('speech_file_id'),
    templateID: id('template_id'),
    settings: jsonb('settings').notNull(),
  },
  (table) => [...workspaceIndexes(table)],
)

export const VideoRenderStatus = ['pending', 'processing', 'completed', 'failed'] as const
export const videoRenderStatusEnum = pgEnum('status', VideoRenderStatus)

export const VideoRenderTable = pgTable(
  'video_render',
  {
    ...workspaceColumns,
    ...timestampColumns,
    videoID: id('video_id').notNull(),
    remotionRenderID: varchar('remotion_render_id', { length: 255 }).notNull(),
    status: videoRenderStatusEnum().notNull(),
  },
  (table) => [...workspaceIndexes(table)],
)
