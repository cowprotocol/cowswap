import { ReactElement } from 'react'

import { Trans } from '@lingui/react/macro'
import { AlertCircle } from 'react-feather'

import { AFFILIATE_SUPPORTED_NETWORK_NAMES } from 'modules/affiliate/config/affiliateProgram.const'
import {
  UnsupportedNetworkCard,
  UnsupportedNetworkHeader,
  UnsupportedNetworkMessage,
} from 'modules/affiliate/pure/shared'

import { UnsupportedNetworksText } from 'common/pure/UnsupportedNetworksText'

export function MyRewardsUnsupportedNetwork(): ReactElement {
  const supportedNetworks = AFFILIATE_SUPPORTED_NETWORK_NAMES.join(', ')

  return (
    <UnsupportedNetworkCard>
      <UnsupportedNetworkHeader>
        <AlertCircle size={20} />
        <Trans>Switch network</Trans>
      </UnsupportedNetworkHeader>
      <UnsupportedNetworkMessage>
        <UnsupportedNetworksText />
        <br />({supportedNetworks})
      </UnsupportedNetworkMessage>
    </UnsupportedNetworkCard>
  )
}
