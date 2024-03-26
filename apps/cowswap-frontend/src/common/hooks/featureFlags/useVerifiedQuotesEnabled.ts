import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function useVerifiedQuotesEnabled(chainId: SupportedChainId): boolean {
  const { verifyQuotesMainnet, verifyQuotesGnosis, verifyQuotesSepolia } = useFeatureFlags()

  const map: Record<SupportedChainId, boolean> = {
    [SupportedChainId.MAINNET]: !!verifyQuotesMainnet,
    [SupportedChainId.GNOSIS_CHAIN]: !!verifyQuotesGnosis,
    [SupportedChainId.SEPOLIA]: !!verifyQuotesSepolia,
  }

  return map[chainId]
}
