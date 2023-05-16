import { FavouriteButton as FavouriteButtonPure } from '@cow/modules/tokens/pure'
import { useFavouriteToken } from '@cow/modules/tokens/hooks/useFavouriteToken'
import { Token } from '@uniswap/sdk-core'
import { MouseEventHandler, useCallback } from 'react'

interface FavouriteButtonProps {
  tokenData: Token
}

export function FavouriteButton({ tokenData }: FavouriteButtonProps) {
  const { isFavourite, toggleFavourite } = useFavouriteToken({ tokenData })
  const onClick: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault()
      toggleFavourite()
    },
    [toggleFavourite]
  )

  return <FavouriteButtonPure isFavourite={isFavourite} onClick={onClick} />
}
