import { PropsWithChildren } from 'react'

export const NEXT_PUBLIC_LAUNCH_DARKLY_KEY = process.env.NEXT_PUBLIC_LAUNCH_DARKLY_KEY || ''

console.log('NEXT_PUBLIC_LAUNCH_DARKLY_KEY', NEXT_PUBLIC_LAUNCH_DARKLY_KEY)

import { withLDProvider } from 'launchdarkly-react-client-sdk'

// TODO: remove duplicated component with app/cowswap-frontend/src/modules/application/containers/WithLDProvider

function InnerWithLDProvider({ children }: PropsWithChildren) {
  return children
}

export const WithLDProvider = withLDProvider<PropsWithChildren & JSX.IntrinsicAttributes>({
  clientSideID: NEXT_PUBLIC_LAUNCH_DARKLY_KEY,
  options: {
    bootstrap: 'localStorage',
  },
})(InnerWithLDProvider)
