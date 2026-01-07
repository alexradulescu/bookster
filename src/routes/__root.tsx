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
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            paddingTop: 'var(--safe-area-inset-top)',
            paddingLeft: 'var(--safe-area-inset-left)',
            paddingRight: 'var(--safe-area-inset-right)',
          }}
        >
          <Outlet />
        </Box>
      </ConvexProvider>
    </ErrorBoundary>
  )
}
