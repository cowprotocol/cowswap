import { PropsWithChildren } from 'react'

import { withLDProvider } from 'launchdarkly-react-client-sdk'
import { LAUNCH_DARKLY_CLIENT_KEY } from '@cowprotocol/common-const'

// TODO: remove duplicated component with app/cowswap-frontend/src/modules/application/containers/WithLDProvider

function InnerWithLDProvider({ children }: PropsWithChildren) {
  return <>{children}</>
}
export const WithLDProvider = withLDProvider<PropsWithChildren & JSX.IntrinsicAttributes>({
  clientSideID: LAUNCH_DARKLY_CLIENT_KEY,
  options: {
    bootstrap: 'localStorage',
  },
})(InnerWithLDProvider)
