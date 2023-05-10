import { LAUNCH_DARKLY_CLIENT_KEY } from '@cow/constants/launchDarkly'
import { withLDProvider } from 'launchdarkly-react-client-sdk'
import { PropsWithChildren } from 'react'

function InnerWithLDProvider({ children }: PropsWithChildren) {
  return <>{children}</>
}
export const WithLDProvider = withLDProvider<PropsWithChildren & JSX.IntrinsicAttributes>({
  clientSideID: LAUNCH_DARKLY_CLIENT_KEY,
  options: {
    bootstrap: 'localStorage',
  },
})(InnerWithLDProvider)
