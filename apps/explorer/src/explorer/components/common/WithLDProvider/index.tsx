import { JSX, PropsWithChildren, ReactNode } from 'react'

import { LAUNCH_DARKLY_CLIENT_KEY } from '@cowprotocol/common-const'

import { withLDProvider } from 'launchdarkly-react-client-sdk'

import { useBootFeatureFlagsSync } from '../../../../hooks/useBootFeatureFlagsSync'

// TODO: remove duplicated component with app/cowswap-frontend/src/modules/application/containers/WithLDProvider

/**
 * Sits inside the provider so it can read the client, which is also the only place the boot flags
 * can be copied out of LaunchDarkly.
 */
function InnerWithLDProvider({ children }: PropsWithChildren): ReactNode {
  useBootFeatureFlagsSync()

  return children
}

export const WithLDProvider = withLDProvider<PropsWithChildren & JSX.IntrinsicAttributes>({
  clientSideID: LAUNCH_DARKLY_CLIENT_KEY,
  context: {
    kind: 'user',
    key: 'explorer',
    name: 'explorer',
  },
  options: {
    bootstrap: 'localStorage',
  },
})(InnerWithLDProvider)
