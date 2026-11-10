import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'
import { AlertTriangle } from 'react-feather'

import { UnsupportedNetworksText } from 'common/pure/UnsupportedNetworksText'

import { UnsupportedNetworkCard, UnsupportedNetworkHeader, UnsupportedNetworkMessage } from '../shared'

interface AffiliateTraderUnsupportedNetworkProps {
  supportedNetworks: string[]
}

export function AffiliateTraderUnsupportedNetwork({
  supportedNetworks,
}: AffiliateTraderUnsupportedNetworkProps): ReactNode {
  return (
    <UnsupportedNetworkCard>
      <UnsupportedNetworkHeader>
        <AlertTriangle size={20} />
        <Trans>Switch network</Trans>
      </UnsupportedNetworkHeader>
      <UnsupportedNetworkMessage>
        <p>
          <UnsupportedNetworksText />
        </p>
        <p>({supportedNetworks.join(', ')})</p>
      </UnsupportedNetworkMessage>
    </UnsupportedNetworkCard>
  )
}
