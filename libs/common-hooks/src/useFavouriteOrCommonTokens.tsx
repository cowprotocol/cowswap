import { useMemo } from 'react'

import { COMMON_BASES } from '@cowswap/common-const'
import { useFavouriteTokens } from 'legacy/state/user/hooks'

import { useWalletInfo } from '@cowswap/wallet'

export function useFavouriteOrCommonTokens() {
  const { chainId } = useWalletInfo()

  const favouriteTokens = useFavouriteTokens()

  return useMemo(() => {
    const bases = typeof chainId !== 'undefined' ? COMMON_BASES[chainId] ?? [] : []
    return favouriteTokens.length > 0 ? favouriteTokens : bases
  }, [chainId, favouriteTokens])
}
