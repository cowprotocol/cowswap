import { getChainInfo } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/macro'

import { useFeatureFlags } from './featureFlags/useFeatureFlags'

export function useUnsupportedNetworksText(): JSX.Element {
  const { isSepoliaEnabled } = useFeatureFlags()

  const allNetworks = isSepoliaEnabled
    ? ALL_SUPPORTED_CHAIN_IDS
    : ALL_SUPPORTED_CHAIN_IDS.filter((id) => id !== SupportedChainId.SEPOLIA)

  return (
    <Trans>
      Please connect your wallet to one of our supported networks:
      <br />
      {allNetworks
        .map((chainId) => getChainInfo(chainId)?.label)
        .filter(Boolean)
        .join(', ')}
    </Trans>
  )
}
