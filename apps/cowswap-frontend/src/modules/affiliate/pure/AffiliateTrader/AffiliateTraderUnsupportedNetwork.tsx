import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'
import { AlertCircle } from 'react-feather'

import { UnsupportedNetworksText } from 'common/pure/UnsupportedNetworksText'

import { AFFILIATE_SUPPORTED_NETWORK_NAMES } from '../../config/affiliateProgram.const'
import { UnsupportedNetworkCard, UnsupportedNetworkHeader, UnsupportedNetworkMessage } from '../shared'

export function AffiliateTraderUnsupportedNetwork(): ReactNode {
  return (
    <UnsupportedNetworkCard>
      <UnsupportedNetworkHeader>
        <AlertCircle size={20} />
        <Trans>Switch network</Trans>
      </UnsupportedNetworkHeader>
      <UnsupportedNetworkMessage>
        <UnsupportedNetworksText />
        <br />({AFFILIATE_SUPPORTED_NETWORK_NAMES.join(', ')})
      </UnsupportedNetworkMessage>
    </UnsupportedNetworkCard>
  )
}
