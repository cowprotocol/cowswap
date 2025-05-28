import React from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'

import SVG from 'react-inlinesvg'

import { StyledToggleArrow } from './styled'

export interface ToggleArrowProps {
  isOpen: boolean
  title?: string
}

export function ToggleArrow({ isOpen, title }: ToggleArrowProps): React.ReactElement {
  const SvgTitle = title ?? (isOpen ? 'Close' : 'Open')
  return (
    <StyledToggleArrow isOpen={isOpen}>
      <SVG src={CarretIcon} title={SvgTitle} />
    </StyledToggleArrow>
  )
}
