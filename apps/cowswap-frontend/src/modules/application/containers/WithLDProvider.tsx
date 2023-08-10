import { PropsWithChildren } from 'react'

import { withLDProvider } from 'launchdarkly-react-client-sdk'

import { LAUNCH_DARKLY_CLIENT_KEY } from 'common/constants/launchDarkly'

function InnerWithLDProvider({ children }: PropsWithChildren) {
  return <>{children}</>
}
export const WithLDProvider = withLDProvider<PropsWithChildren & JSX.IntrinsicAttributes>({
  clientSideID: LAUNCH_DARKLY_CLIENT_KEY,
  options: {
    bootstrap: 'localStorage',
  },
})(InnerWithLDProvider)
