import { ReactNode } from 'react'

import { UnsupportedNetworkBanner } from 'common/pure/UnsupportedNetworkBanner'
import { UnsupportedNetworksText } from 'common/pure/UnsupportedNetworksText'

import { useAffiliateSupportedNetworkNames } from '../hooks/useAffiliateSupportedNetworkNames'

export function UnsupportedNetwork(): ReactNode {
  const supportedNetworks = useAffiliateSupportedNetworkNames().join(', ')

  return (
    <UnsupportedNetworkBanner>
      <UnsupportedNetworksText /> ({supportedNetworks})
    </UnsupportedNetworkBanner>
  )
}
