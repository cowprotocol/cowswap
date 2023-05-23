import { useMemo } from 'react'
import { COMMON_BASES } from 'legacy/constants/routing'
import { useFavouriteTokens } from 'legacy/state/user/hooks'
import { useWalletInfo } from 'modules/wallet'

export function useFavouriteOrCommonTokens() {
  const { chainId } = useWalletInfo()

  const favouriteTokens = useFavouriteTokens()

  return useMemo(() => {
    const bases = typeof chainId !== 'undefined' ? COMMON_BASES[chainId] ?? [] : []
    return favouriteTokens.length > 0 ? favouriteTokens : bases
  }, [chainId, favouriteTokens])
}
