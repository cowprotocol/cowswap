import { PropsWithChildren } from 'react'

import { LAUNCH_DARKLY_CLIENT_KEY } from '@cowprotocol/common-const'

import { withLDProvider } from 'launchdarkly-react-client-sdk'

function InnerWithLDProvider({ children }: PropsWithChildren) {
  return children
}

export const WithLDProvider = withLDProvider<PropsWithChildren & JSX.IntrinsicAttributes>({
  clientSideID: LAUNCH_DARKLY_CLIENT_KEY,
  options: {
    bootstrap: 'localStorage',
  },
})(InnerWithLDProvider)
