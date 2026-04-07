import { ReactNode } from 'react'

import { UnsupportedNetworkBanner } from 'common/pure/UnsupportedNetworkBanner'
import { UnsupportedNetworksText } from 'common/pure/UnsupportedNetworksText'

import { AFFILIATE_SUPPORTED_NETWORK_NAMES } from '../config/affiliateProgram.const'

export function UnsupportedNetwork(): ReactNode {
  const supportedNetworks = AFFILIATE_SUPPORTED_NETWORK_NAMES.join(', ')

  return (
    <UnsupportedNetworkBanner>
      <UnsupportedNetworksText /> ({supportedNetworks})
    </UnsupportedNetworkBanner>
  )
}
