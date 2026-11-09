import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'
import { AlertTriangle } from 'react-feather'

import { UnsupportedNetworksText } from 'common/pure/UnsupportedNetworksText'

import { useAffiliateSupportedNetworkNames } from '../../hooks/useAffiliateSupportedNetworkNames'
import { UnsupportedNetworkCard, UnsupportedNetworkHeader, UnsupportedNetworkMessage } from '../shared'

export function AffiliateTraderUnsupportedNetwork(): ReactNode {
  const supportedNetworks = useAffiliateSupportedNetworkNames().join(', ')

  return (
    <UnsupportedNetworkCard>
      <UnsupportedNetworkHeader>
        <AlertTriangle size={20} />
        <Trans>Switch network</Trans>
      </UnsupportedNetworkHeader>
      <UnsupportedNetworkMessage>
        <UnsupportedNetworksText />
        <br />({supportedNetworks})
      </UnsupportedNetworkMessage>
    </UnsupportedNetworkCard>
  )
}
