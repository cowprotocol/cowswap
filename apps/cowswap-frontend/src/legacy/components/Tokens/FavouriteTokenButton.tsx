import { MouseEventHandler, useCallback, useMemo } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { ButtonStar } from '@cowprotocol/ui'
import { Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { useFavouriteTokens, useToggleFavouriteToken } from 'legacy/state/user/hooks'

import { UI } from 'common/constants/theme'

export const StyledButtonStar = styled(ButtonStar)`
  z-index: 9;
`

type FavouriteTokenButtonParams = {
  tokenData: Token
}

export default function FavouriteTokenButton({ tokenData }: FavouriteTokenButtonParams) {
  const favouriteTokens = useFavouriteTokens()
  const theme = useTheme()

  const toggleFavouriteToken = useToggleFavouriteToken()

  const handleFavouriteToken: MouseEventHandler = useCallback(
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

  return (
    <StyledButtonStar
      stroke={theme.text1}
      fill={isFavouriteToken ? `var(${UI.COLOR_TEXT1})` : undefined}
      onClick={handleFavouriteToken}
    />
  )
}
