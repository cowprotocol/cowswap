import React from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'

import { t } from '@lingui/core/macro'
import SVG from 'react-inlinesvg'

import { StyledToggleArrow } from './styled'

export interface ToggleArrowProps {
  isOpen: boolean
  title?: string
  size?: number
}

export function ToggleArrow({ isOpen, title, size }: ToggleArrowProps): React.ReactElement {
  const SvgTitle = title ?? (isOpen ? t`Close` : t`Open`)
  return (
    <StyledToggleArrow size={size} isOpen={isOpen}>
      <SVG src={CarretIcon} title={SvgTitle} />
    </StyledToggleArrow>
  )
}
