import { NativeCurrency, Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { useAllTokensList } from 'cow-react/common/hooks/useAllTokensList'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useFavouriteTokens } from 'state/user/hooks'
import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { useWeb3React } from '@web3-react/core'

const checkBySymbolAndAddress = (token: Token, symbolOrAddress: string) =>
  token.address.toLowerCase() === symbolOrAddress.toLowerCase() ||
  token.symbol?.toLowerCase() === symbolOrAddress.toLowerCase()

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): Token | NativeCurrency | null {
  const { chainId } = useWeb3React()
  const tokens = useAllTokensList()
  const nativeCurrency = useNativeCurrency()
  const favouriteTokens = useFavouriteTokens()
  const isSupportedNetwork = isSupportedChainId(chainId)

  return useMemo(() => {
    if (!symbolOrAddress || !isSupportedNetwork) {
      return null
    }

    const symbolOrAddressLowerCase = symbolOrAddress.toLowerCase()

    if (nativeCurrency.symbol?.toLowerCase() === symbolOrAddressLowerCase) {
      return nativeCurrency
    }

    return (
      tokens.find((item) => checkBySymbolAndAddress(item, symbolOrAddress)) ||
      favouriteTokens.find((item) => checkBySymbolAndAddress(item, symbolOrAddress)) ||
      null
    )
  }, [symbolOrAddress, isSupportedNetwork, nativeCurrency, tokens, favouriteTokens])
}
