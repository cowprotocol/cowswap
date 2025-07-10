import { TokenWithLogo } from '@cowprotocol/common-const'
import { BridgeQuoteResults } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'

interface UseGetMaybeIntermediateTokenProps {
  bridgeQuote: BridgeQuoteResults | null
}

// returns the intermediate buy token (if it exists) and its address (if it exists)
export function useGetMaybeIntermediateToken({ bridgeQuote }: UseGetMaybeIntermediateTokenProps): {
  intermediateBuyToken: TokenWithLogo | null
  intermediateBuyTokenAddress: string | null
} {
  const { sellTokenAddress: intermediateBuyTokenAddress } = bridgeQuote?.tradeParameters || {}
  const tokensByAddress = useTokensByAddressMap()

  if (!intermediateBuyTokenAddress) {
    return { intermediateBuyToken: null, intermediateBuyTokenAddress: null }
  }

  const intermediateBuyToken = tokensByAddress[intermediateBuyTokenAddress.toLowerCase()] || null

  return { intermediateBuyToken, intermediateBuyTokenAddress }
}
