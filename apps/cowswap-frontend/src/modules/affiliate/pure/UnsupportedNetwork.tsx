import { ReactNode } from 'react'

import { UnsupportedNetworkBanner } from 'common/pure/UnsupportedNetworkBanner'
import { UnsupportedNetworksText } from 'common/pure/UnsupportedNetworksText'

interface UnsupportedNetworkProps {
  supportedNetworks: string[]
}

export function UnsupportedNetwork({ supportedNetworks }: UnsupportedNetworkProps): ReactNode {
  return (
    <UnsupportedNetworkBanner>
      <UnsupportedNetworksText /> ({supportedNetworks.join(', ')})
    </UnsupportedNetworkBanner>
  )
}
