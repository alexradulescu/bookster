import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Box } from '@mantine/core'
import ConvexProvider from '../integrations/convex/provider'
import { ErrorBoundary } from '../components/common/ErrorBoundary'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ErrorBoundary>
      <ConvexProvider>
        <Box
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 'var(--safe-area-inset-top)',
            paddingBottom: 'var(--safe-area-inset-bottom)',
            paddingLeft: 'var(--safe-area-inset-left)',
            paddingRight: 'var(--safe-area-inset-right)',
            background: 'transparent',
          }}
        >
          <Outlet />
        </Box>
      </ConvexProvider>
    </ErrorBoundary>
  )
}
