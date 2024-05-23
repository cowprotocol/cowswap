import { getChainInfo } from '@cowprotocol/common-const'

import { Trans } from '@lingui/macro'

import { useAvailableChains } from '@cowprotocol/common-hooks'

export function useUnsupportedNetworksText(): JSX.Element {
  const availableChains = useAvailableChains()

  return (
    <Trans>
      Please connect your wallet to one of our supported networks:
      <br />
      {availableChains
        .map((chainId) => getChainInfo(chainId)?.label)
        .filter(Boolean)
        .join(', ')}
    </Trans>
  )
}
