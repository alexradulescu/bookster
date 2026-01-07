import { ConvexProvider, ConvexReactClient } from 'convex/react'
import type { ReactNode } from 'react'

const convexUrl = import.meta.env.VITE_CONVEX_URL

if (!convexUrl) {
  console.warn(
    'Missing VITE_CONVEX_URL environment variable. Convex features will not work.',
  )
}

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export default function AppConvexProvider({
  children,
}: {
  children: ReactNode
}) {
  if (!convex) {
    // Return children without Convex provider if no URL is configured
    return <>{children}</>
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
