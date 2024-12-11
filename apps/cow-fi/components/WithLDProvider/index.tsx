import { PropsWithChildren } from 'react'

export const NEXT_PUBLIC_LAUNCH_DARKLY_KEY = process.env.NEXT_PUBLIC_LAUNCH_DARKLY_KEY || ''

console.log('NEXT_PUBLIC_LAUNCH_DARKLY_KEY', NEXT_PUBLIC_LAUNCH_DARKLY_KEY)

import { withLDProvider } from 'launchdarkly-react-client-sdk'

function InnerWithLDProvider({ children }: PropsWithChildren) {
  return children
}

export const WithLDProvider = withLDProvider<PropsWithChildren & JSX.IntrinsicAttributes>({
  clientSideID: NEXT_PUBLIC_LAUNCH_DARKLY_KEY,
  options: {
    bootstrap: 'localStorage',
  },
})(InnerWithLDProvider)
