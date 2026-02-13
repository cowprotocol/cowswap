import { ReactElement } from 'react'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { UnsupportedNetworkBanner } from 'common/pure/UnsupportedNetworkBanner'
import { UnsupportedNetworksText } from 'common/pure/UnsupportedNetworksText'
export function WalletUnsupportedNetworkBanner(): ReactElement {
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()

  return (
    <>
      {isChainIdUnsupported && (
        <UnsupportedNetworkBanner>
          <UnsupportedNetworksText />
        </UnsupportedNetworkBanner>
      )}
    </>
  )
}
