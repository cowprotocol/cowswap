import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'

import { NativeCurrency, Token } from '@uniswap/sdk-core'

import { useFavouriteTokens } from 'legacy/state/user/hooks'

import { tokensByAddressAtom, tokensBySymbolAtom } from 'modules/tokensList/state/tokensListAtom'
import { useWalletInfo } from 'modules/wallet'

import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { doesTokenMatchSymbolOrAddress } from 'utils/doesTokenMatchSymbolOrAddress'

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): Token | NativeCurrency | null {
  const { chainId } = useWalletInfo()
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

    return favouriteTokens.find((item) => doesTokenMatchSymbolOrAddress(item, symbolOrAddress)) || null
  }, [symbolOrAddress, isSupportedNetwork, nativeCurrency, tokensByAddress, tokensBySymbol, favouriteTokens])
}
