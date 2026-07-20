import { ReactNode } from 'react'

import { ProductLogo, ProductVariant } from '@cowprotocol/ui'

import * as styledEl from './BaseAccountCard.styled'

interface BaseAccountCardProps {
  children: ReactNode
  width?: number | string
  height?: number | string
  borderRadius?: number
  padding?: number
  enableScale?: boolean
  enableParentHover?: boolean
  margin?: string
  minHeight?: number | string
  showWatermark?: boolean
  ariaLabel?: string
}

export function BaseAccountCard({
  children,
  width,
  height,
  borderRadius,
  padding,
  enableScale = false,
  enableParentHover = false,
  margin,
  minHeight,
  showWatermark = false,
  ariaLabel,
}: BaseAccountCardProps): ReactNode {
  return (
    <styledEl.AccountCardWrapper
      $width={width}
      $height={height}
      $borderRadius={borderRadius}
      $padding={padding}
      $enableScale={enableScale}
      $enableParentHover={enableParentHover}
      $margin={margin}
      $minHeight={minHeight}
      role="article"
      aria-label={ariaLabel || 'Account overview'}
    >
      {children}
      {showWatermark && (
        <styledEl.WatermarkIcon>
          <ProductLogo variant={ProductVariant.CowProtocol} logoIconOnly height={140} />
        </styledEl.WatermarkIcon>
      )}
    </styledEl.AccountCardWrapper>
  )
}
