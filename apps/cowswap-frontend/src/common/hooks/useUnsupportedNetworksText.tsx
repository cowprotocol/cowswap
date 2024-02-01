import { getChainInfo } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/macro'

export function useUnsupportedNetworksText(): JSX.Element {
  return (
    <Trans>
      Please connect your wallet to one of our supported networks:
      <br />
      {ALL_SUPPORTED_CHAIN_IDS.map((chainId) => getChainInfo(chainId)?.label)
        .filter(Boolean)
        .join(', ')}
    </Trans>
  )
}
