import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$workspaceID/settings')({
  component: SettingsComponent,
})

function SettingsComponent() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Settings</h1>
      <p style={{ color: '#6b7280' }}>Settings content will go here.</p>
    </div>
  )
}

