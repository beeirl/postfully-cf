import { withActor } from '@/context/auth.withActor'
import { Actor } from '@postfully/core/actor'
import { eq, isNull, and, desc } from 'drizzle-orm'
import { Database } from '@postfully/core/database/index'
import { UserTable } from '@postfully/core/user/index.sql'
import { WorkspaceTable } from '@postfully/core/workspace/index.sql'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const workspaceID = await getLastSeenWorkspaceID()
          return redirect({ to: `/${workspaceID}` })
        } catch {
          return redirect({ to: '/auth/authorize' })
        }
      },
    },
  },
})

async function getLastSeenWorkspaceID() {
  return withActor(async () => {
    const actor = Actor.assert('account')
    return Database.use(async (tx) =>
      tx
        .select({ id: WorkspaceTable.id })
        .from(UserTable)
        .innerJoin(WorkspaceTable, eq(UserTable.workspaceID, WorkspaceTable.id))
        .where(
          and(
            eq(UserTable.accountID, actor.properties.accountID),
            isNull(UserTable.archivedAt),
            isNull(WorkspaceTable.archivedAt),
          ),
        )
        .orderBy(desc(UserTable.lastSeenAt))
        .limit(1)
        .then((rows) => rows[0]?.id),
    )
  })
}
