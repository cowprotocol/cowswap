import { MouseEventHandler, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { useFavouriteTokens, useToggleFavouriteToken } from '@cowprotocol/tokens'
import { ButtonStar } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'
import { Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

export const StyledButtonStar = styled(ButtonStar)`
  z-index: 9;
`

type FavouriteTokenButtonParams = {
  tokenData: TokenWithLogo
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
      fill={isFavouriteToken ? `var(${UI.COLOR_TEXT})` : undefined}
      onClick={handleFavouriteToken}
    />
  )
}
