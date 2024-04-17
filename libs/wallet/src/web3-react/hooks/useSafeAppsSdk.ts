import { useState } from 'react'

import SafeAppsSDK from '@safe-global/safe-apps-sdk'

export function useSafeAppsSdk(): SafeAppsSDK | null {
  const [safeAppsSdk] = useState<SafeAppsSDK | null>(null)
  // TODO: FIXME
  // const { connector, isActive } = useWeb3React()

  // useEffect(() => {
  //   if (!isActive || !(connector instanceof GnosisSafe) || !connector.sdk) {
  //     setSafeAppsSdk(null)
  //   } else {
  //     setSafeAppsSdk(connector.sdk)
  //   }
  // }, [isActive, connector])

  return safeAppsSdk
}
