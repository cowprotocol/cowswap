import { useCallback, useMemo } from 'react'
import { Token } from '@uniswap/sdk-core'
import { useFavouriteTokens, useToggleFavouriteToken } from 'state/user/hooks'
import { ButtonStar } from 'components/Button'

type FavouriteTokenButtonParams = {
  tokenData: Token
}

export default function FavouriteTokenButton({ tokenData }: FavouriteTokenButtonParams) {
  const favouriteTokens = useFavouriteTokens()

  const toggleFavouriteToken = useToggleFavouriteToken()

  const handleFavouriteToken = useCallback(
    (event) => {
      event.preventDefault()
      toggleFavouriteToken(tokenData)
    },
    [toggleFavouriteToken, tokenData]
  )

  const isFavouriteToken = useMemo(
    () => favouriteTokens.some((t: Token) => t.address === tokenData.address),
    [favouriteTokens, tokenData]
  )

  return <ButtonStar fill={isFavouriteToken} onClick={handleFavouriteToken} />
}
