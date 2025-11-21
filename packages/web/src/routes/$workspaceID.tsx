import { withActor } from '@/context/auth.withActor'
import { AppLayout } from '@beeirl/ui/app-layout'
import { Avatar } from '@beeirl/ui/avatar'
import { ChevronDownIcon, SettingsIcon } from '@beeirl/ui/line-icons'
import { Menu } from '@beeirl/ui/menu'
import { Sidebar } from '@beeirl/ui/sidebar'
import { Account } from '@postfully/core/account/index'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, linkOptions, MatchRoute, Outlet, useParams } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getWorkspacesFn = createServerFn().handler(() => {
  return withActor(() => {
    return Account.workspaces()
  })
})

const workspacesQueryOptions = () =>
  queryOptions({
    queryKey: ['workspaces'],
    queryFn: () => getWorkspacesFn(),
  })

export const Route = createFileRoute('/$workspaceID')({
  ssr: 'data-only',
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(workspacesQueryOptions())
  },
})

export const appSidebarHandle = Sidebar.createHandle()

const RedditStoriesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 2L3 7V17H8V12H12V17H17V7L10 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

const sidebarMenuItems = [
  {
    icon: RedditStoriesIcon,
    title: 'Reddit Stories',
    linkOptions: linkOptions({
      from: Route.fullPath,
      to: './reddit-stories',
    }),
  },
  {
    icon: SettingsIcon,
    title: 'Settings',
    linkOptions: linkOptions({
      from: Route.fullPath,
      to: './settings',
    }),
    fuzzyMatch: true,
  },
]

function RouteComponent() {
  const workspacesQuery = useSuspenseQuery(workspacesQueryOptions())
  const params = useParams({ from: '/$workspaceID' })
  const workspaces = workspacesQuery.data ?? []
  const currentWorkspace = workspaces.find((w) => w.id === params.workspaceID)

  return (
    <AppLayout.Root>
      <Sidebar.Provider>
        <Sidebar.Root handle={appSidebarHandle} name="app">
          <Sidebar.Header>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Menu.Root>
                  <Menu.Trigger
                    render={(props, state) => (
                      <Sidebar.MenuButton {...props} active={state.open} className="w-fit">
                        <Avatar.Root className="rounded-md" color="gray" variant="soft">
                          <Avatar.Fallback>
                            <Avatar.Initials>{currentWorkspace?.name ?? 'W'}</Avatar.Initials>
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{currentWorkspace?.name ?? 'Workspace'}</span>
                          <ChevronDownIcon className="size-3.5 text-gray-500" />
                        </div>
                      </Sidebar.MenuButton>
                    )}
                  />
                  <Menu.Positioner align="start" side="top" sideOffset={5}>
                    <Menu.Popup className="min-w-48">
                      <Menu.Group>
                        {workspaces.map((workspace) => (
                          <Menu.Item
                            key={workspace.id}
                            render={
                              <Link
                                to="/$workspaceID"
                                params={{ workspaceID: workspace.id }}
                                className={workspace.id === params.workspaceID ? 'font-semibold' : ''}
                              />
                            }
                          >
                            {workspace.name}
                          </Menu.Item>
                        ))}
                      </Menu.Group>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Root>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Header>
          <Sidebar.Content className="no-scrollbar">
            <Sidebar.Group>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  {sidebarMenuItems.map((item, index) => (
                    <MatchRoute key={`sidebar-menu-item-${index}`} fuzzy={item.fuzzyMatch} {...item.linkOptions}>
                      {(match) => (
                        <Sidebar.MenuItem>
                          <Sidebar.MenuButton active={!!match} render={<Link {...item.linkOptions} />}>
                            <item.icon />
                            {item.title}
                          </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                      )}
                    </MatchRoute>
                  ))}
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer className="pt-0" />
        </Sidebar.Root>
        <Outlet />
      </Sidebar.Provider>
    </AppLayout.Root>
  )
}
