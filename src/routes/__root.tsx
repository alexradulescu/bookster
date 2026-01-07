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
            height: '100svh',
            overflow: 'hidden',
          }}
        >
          <Outlet />
        </Box>
      </ConvexProvider>
    </ErrorBoundary>
  )
}
