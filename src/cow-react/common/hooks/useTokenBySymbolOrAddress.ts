import { NativeCurrency, Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useFavouriteTokens } from 'state/user/hooks'
import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { useWeb3React } from '@web3-react/core'
import { useAtomValue } from 'jotai/utils'
import { tokensByAddressAtom, tokensBySymbolAtom } from '@cow/modules/tokensList/tokensListAtom'

const checkBySymbolAndAddress = (token: Token, symbolOrAddress: string) =>
  token.address.toLowerCase() === symbolOrAddress.toLowerCase() ||
  token.symbol?.toLowerCase() === symbolOrAddress.toLowerCase()

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): Token | NativeCurrency | null {
  const { chainId } = useWeb3React()
  const tokensByAddress = useAtomValue(tokensByAddressAtom)
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom)
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

    const foundByAddress = tokensByAddress[symbolOrAddressLowerCase]

    if (foundByAddress) return foundByAddress

    const foundBySymbol = tokensBySymbol[symbolOrAddressLowerCase]

    if (foundBySymbol) return foundBySymbol[0]

    return favouriteTokens.find((item) => checkBySymbolAndAddress(item, symbolOrAddress)) || null
  }, [symbolOrAddress, isSupportedNetwork, nativeCurrency, tokensByAddress, tokensBySymbol, favouriteTokens])
}
