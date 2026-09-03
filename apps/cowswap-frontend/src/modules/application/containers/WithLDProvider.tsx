import { JSX, PropsWithChildren, ReactNode } from 'react'

import { LAUNCH_DARKLY_CLIENT_KEY } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { withLDProvider } from 'launchdarkly-react-client-sdk'

function InnerWithLDProvider({ children }: PropsWithChildren): ReactNode {
  return children
}

export const WithLDProvider = window.__COWSWAP_E2E__
  ? Noop
  : withLDProvider<PropsWithChildren & JSX.IntrinsicAttributes>({
      clientSideID: LAUNCH_DARKLY_CLIENT_KEY,
      context: {
        kind: 'user',
        key: 'cowswap',
        name: 'cowswap',
      },
      options: {
        bootstrap: 'localStorage',
        sendEvents: !isInjectedWidget(),
      },
    })(InnerWithLDProvider)

function Noop({ children }: { children: ReactNode }): ReactNode {
  return children
}
