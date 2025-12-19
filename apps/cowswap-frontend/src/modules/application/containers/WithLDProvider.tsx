import { JSX, PropsWithChildren, ReactNode } from 'react'

import { LAUNCH_DARKLY_CLIENT_KEY } from '@cowprotocol/common-const'

import { withLDProvider } from 'launchdarkly-react-client-sdk'

function InnerWithLDProvider({ children }: PropsWithChildren): ReactNode {
  return children
}

export const WithLDProvider = withLDProvider<PropsWithChildren & JSX.IntrinsicAttributes>({
  clientSideID: LAUNCH_DARKLY_CLIENT_KEY,
  context: {
    kind: 'user',
    key: 'cowswap',
    name: 'cowswap',
  },
  options: {
    bootstrap: 'localStorage',
  },
})(InnerWithLDProvider)
