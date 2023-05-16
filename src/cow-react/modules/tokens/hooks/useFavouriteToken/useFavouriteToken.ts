import { useToggleFavouriteToken } from '@src/state/user/hooks'
import { useFavouriteTokens } from '@src/state/user/hooks'
import { Token } from '@uniswap/sdk-core'
import { useCallback, useMemo } from 'react'

interface UseFavouriteTokenParams {
  tokenData: Token
}

interface UseFavouriteTokenResult {
  isFavourite: boolean
  toggleFavourite: () => void
}

export function useFavouriteToken({ tokenData }: UseFavouriteTokenParams): UseFavouriteTokenResult {
  const favouriteTokens = useFavouriteTokens()
  const toggleFavouriteToken = useToggleFavouriteToken()
  const toggleFavourite = useCallback(() => toggleFavouriteToken(tokenData), [toggleFavouriteToken, tokenData])
  const isFavourite = useMemo(
    () => favouriteTokens.some((token: Token) => token.address === tokenData.address),
    [favouriteTokens, tokenData]
  )

  return {
    isFavourite,
    toggleFavourite,
  }
}
