import { ButtonStar } from '@src/components/Button'
import { MouseEventHandler } from 'react'
import styled, { useTheme } from 'styled-components/macro'

export const StyledButtonStar = styled(ButtonStar)`
  z-index: 9;
`
interface FavouriteButtonProps {
  isFavourite: boolean
  onClick: MouseEventHandler
}

export function FavouriteButton({ isFavourite, onClick }: FavouriteButtonProps) {
  const theme = useTheme()

  const fill = isFavourite ? theme.text1 : undefined
  return <StyledButtonStar stroke={theme.text1} fill={fill} onClick={onClick} />
}
