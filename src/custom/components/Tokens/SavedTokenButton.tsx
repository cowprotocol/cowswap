import { useCallback, useMemo } from 'react'
import { Token } from '@uniswap/sdk-core'
import { useFavouriteTokens, useToggleFavouriteToken } from 'state/user/hooks'
import { ButtonStar } from 'components/Button'

type SavedTokenButtonParams = {
  tokenData: Token
}

export default function SavedTokenButton({ tokenData }: SavedTokenButtonParams) {
  const favouriteTokens = useFavouriteTokens()

  const toggleFavouriteToken = useToggleFavouriteToken()

  const handleSavedToken = useCallback(
    (event) => {
      event.preventDefault()
      toggleFavouriteToken(tokenData)
    },
    [toggleFavouriteToken, tokenData]
  )

  const isSavedToken = useMemo(
    () => favouriteTokens.some((t: Token) => t.address === tokenData.address),
    [favouriteTokens, tokenData]
  )

  return <ButtonStar fill={isSavedToken} onClick={handleSavedToken} />
}
