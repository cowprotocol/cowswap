import { MouseEventHandler, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { useFavoriteTokens, useToggleFavoriteToken } from '@cowprotocol/tokens'
import { ButtonStar } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'
import { Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

export const StyledButtonStar = styled(ButtonStar)`
  z-index: 9;
`

type FavoriteTokenButtonParams = {
  tokenData: TokenWithLogo
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function FavoriteTokenButton({ tokenData }: FavoriteTokenButtonParams) {
  const favoriteTokens = useFavoriteTokens()
  const theme = useTheme()

  const toggleFavoriteToken = useToggleFavoriteToken()

  const handleFavoriteToken: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault()
      toggleFavoriteToken(tokenData)
    },
    [toggleFavoriteToken, tokenData]
  )

  const isFavoriteToken = useMemo(
    () => favoriteTokens.some((t: Token) => t.address === tokenData.address),
    [favoriteTokens, tokenData]
  )

  return (
    <StyledButtonStar
      stroke={theme.text1}
      fill={isFavoriteToken ? `var(${UI.COLOR_TEXT})` : undefined}
      onClick={handleFavoriteToken}
    />
  )
}
