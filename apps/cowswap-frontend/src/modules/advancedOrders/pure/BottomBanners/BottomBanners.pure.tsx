import { DeprecatedNetworkBanner } from 'modules/swap'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'

export function BottomBanners(): React.ReactNode {
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()

  if (isProviderNetworkDeprecated) {
    return <DeprecatedNetworkBanner />
  }

  return null
}
