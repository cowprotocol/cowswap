import { getChainInfo } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/macro'


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
