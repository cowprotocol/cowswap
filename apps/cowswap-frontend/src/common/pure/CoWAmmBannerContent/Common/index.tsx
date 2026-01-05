import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import ICON_STAR from 'assets/cow-swap/star-shine.svg'
import SVG from 'react-inlinesvg'

import { useAutoFitText } from '../../../hooks/useAutoFitText'
import * as styledEl from '../styled'

interface TextFitProps {
  children: ReactNode
  mode: 'single' | 'multi'
  minFontSize: number
  maxFontSize: number
}

export function TextFit({ mode, children, minFontSize, maxFontSize }: TextFitProps): ReactNode {
  const textRef = useAutoFitText<HTMLDivElement>({ min: minFontSize, max: maxFontSize, mode })

  return (
    <div
      ref={textRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: mode === 'single' ? 'center' : 'flex-start',
        justifyContent: 'center',
        overflow: 'hidden',
        textAlign: 'center',
        lineHeight: 1.2,
        whiteSpace: mode === 'single' ? 'nowrap' : 'normal',
      }}
    >
      {children}
    </div>
  )
}

interface StarIconProps {
  size: number
  top?: number
  bottom?: number
  right: number
  color?: UI
}

export function StarIcon({ size, top, bottom, right, color }: StarIconProps): ReactNode {
  return (
    <styledEl.StarIcon {...{ size, top, bottom, right, color: color ? `var(${color})` : undefined }}>
      <SVG src={ICON_STAR} />
    </styledEl.StarIcon>
  )
}
