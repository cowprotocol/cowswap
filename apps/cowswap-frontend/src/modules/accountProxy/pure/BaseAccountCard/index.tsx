import { ReactNode } from 'react'

import { ProductLogo, ProductVariant } from '@cowprotocol/ui'

import { AccountCardWrapper, WatermarkIcon } from '../AccountCard/styled'

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
    <AccountCardWrapper
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
        <WatermarkIcon>
          <ProductLogo variant={ProductVariant.CowProtocol} logoIconOnly height={140} />
        </WatermarkIcon>
      )}
    </AccountCardWrapper>
  )
}
