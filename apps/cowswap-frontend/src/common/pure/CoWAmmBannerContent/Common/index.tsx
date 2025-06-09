import React, { ReactNode } from 'react'

import ICON_STAR from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import { Textfit as ReactTextFit } from 'react-textfit'

import * as styledEl from '../styled'

interface TextFitProps {
  children: ReactNode
  mode: 'single' | 'multi'
  minFontSize: number
  maxFontSize: number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TextFit({ mode, children, minFontSize, maxFontSize }: TextFitProps) {
  return (
    <ReactTextFit mode={mode} forceSingleModeWidth={false} min={minFontSize} max={maxFontSize}>
      {children}
    </ReactTextFit>
  )
}

interface StarIconProps {
  size: number
  top?: number
  bottom?: number
  right: number
  color?: UI
}
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function StarIcon({ size, top, bottom, right, color }: StarIconProps) {
  return (
    <styledEl.StarIcon {...{ size, top, bottom, right, color: color ? `var(${color})` : undefined }}>
      <SVG src={ICON_STAR} />
    </styledEl.StarIcon>
  )
}
