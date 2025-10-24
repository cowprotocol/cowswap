import { ReactElement } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/react/macro'

export function useUnsupportedNetworksText(): ReactElement {
  const availableChains = useAvailableChains()

  const chainLabels = availableChains
    .map((chainId) => getChainInfo(chainId)?.label)
    .filter(Boolean)
    .join(', ')

  return (
    <Trans>
      Please connect your wallet to one of our supported networks:
      <br />
      {chainLabels}
    </Trans>
  )
}
