import { JSX, PropsWithChildren } from 'react'
import { withLDProvider } from 'launchdarkly-react-client-sdk'

export const NEXT_PUBLIC_LAUNCH_DARKLY_KEY = process.env.NEXT_PUBLIC_LAUNCH_DARKLY_KEY || ''

console.log('NEXT_PUBLIC_LAUNCH_DARKLY_KEY', NEXT_PUBLIC_LAUNCH_DARKLY_KEY)

function InnerWithLDProvider({ children }: PropsWithChildren) {
  return children
}

export const WithLDProvider = withLDProvider<PropsWithChildren & JSX.IntrinsicAttributes>({
  clientSideID: NEXT_PUBLIC_LAUNCH_DARKLY_KEY,
  options: {
    bootstrap: 'localStorage',
  },
})(InnerWithLDProvider)
