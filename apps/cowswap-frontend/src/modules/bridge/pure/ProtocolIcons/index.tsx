import React, { useState, memo } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { ProductVariant, UI, ProductLogo } from '@cowprotocol/ui'

import { ProtocolIcon, ProtocolIconsContainer, getBorderWidth } from './styled'

export interface ProtocolIconsProps {
  secondProtocol: BridgeProviderInfo
  showOnlyFirst?: boolean
  showOnlySecond?: boolean
  size?: number
}

const DEFAULT_ICON_SIZE = 18 // For stacked icons
const DEFAULT_SINGLE_ICON_SIZE = 36 // For showOnlyFirst
const LOGO_HEIGHT_RATIO = 0.5 // The ratio of the icon size to the logo height
const STACKED_ICON_OVERLAP_RATIO = 0.4 // This drives both visual overlap and mask calculation

interface MaskConfig {
  cx: number
  cy: number
  innerR: number
  outerR: number
}

// Helper function to create mask configuration
const createMask = (
  baseCx: number,
  offsetMultiplier: number,
  distance: number,
  centerY: number,
  innerR: number,
  outerR: number,
): MaskConfig => ({
  cx: baseCx + offsetMultiplier * distance,
  cy: centerY,
  innerR: innerR,
  outerR: outerR,
})

export const ProtocolIcons = memo(function ProtocolIcons({
  secondProtocol,
  showOnlyFirst,
  showOnlySecond,
  size = DEFAULT_ICON_SIZE,
}: ProtocolIconsProps): React.JSX.Element {
  const [hoveredIcon, setHoveredIcon] = useState<'first' | 'second' | null>(null)

  const handleFirstIconMouseEnter = () => setHoveredIcon('first')
  const handleSecondIconMouseEnter = () => setHoveredIcon('second')
  const handleMouseLeave = () => setHoveredIcon(null)

  const isSingleIconDisplay = !!(showOnlyFirst || showOnlySecond)
  const currentDisplaySize = isSingleIconDisplay ? (size === DEFAULT_ICON_SIZE ? DEFAULT_SINGLE_ICON_SIZE : size) : size
  const currentLogoHeight = currentDisplaySize * LOGO_HEIGHT_RATIO

  // Logic for single icon display
  if (isSingleIconDisplay) {
    const protocolName = showOnlyFirst ? 'CoW Swap' : secondProtocol.name
    const protocolBgColor = showOnlyFirst ? UI.COLOR_BLUE_300_PRIMARY : undefined
    const iconChild = showOnlyFirst ? (
      <ProductLogo variant={ProductVariant.CowSwap} height={currentLogoHeight} logoIconOnly />
    ) : (
      <img
        src={secondProtocol.logoUrl}
        width={currentLogoHeight}
        height={currentLogoHeight}
        alt={secondProtocol.name}
      />
    )

    return (
      <ProtocolIcon title={protocolName} size={currentDisplaySize} isStacked={false} bgColor={protocolBgColor}>
        {iconChild}
      </ProtocolIcon>
    )
  }

  // Logic for stacked icons
  const cutThickness = getBorderWidth(currentDisplaySize)
  const cowSwapBgColor = UI.COLOR_BLUE_300_PRIMARY

  const isFirstHovered = hoveredIcon === 'first'
  const isSecondHovered = hoveredIcon === 'second'

  // Determine which icon is on top
  const isFirstOnTop = isFirstHovered
  const isSecondOnTop = isSecondHovered || (!isFirstHovered && !isSecondHovered) // Second defaults to top

  // Z-index configuration
  const firstIconZIndex = isFirstOnTop ? 3 : 1
  const secondIconZIndex = isSecondOnTop ? 3 : isFirstOnTop ? 1 : 2

  // Masking parameters
  const radiusOfTopIcon = currentDisplaySize / 2
  const maskOuterRadius = radiusOfTopIcon + cutThickness
  const maskCenterY = currentDisplaySize / 2
  const iconCenterBaseX = currentDisplaySize / 2
  const distanceBetweenCenters = currentDisplaySize * (1 - STACKED_ICON_OVERLAP_RATIO)

  // Mask configurations
  const firstMaskConfig = !isFirstOnTop
    ? createMask(iconCenterBaseX, 1, distanceBetweenCenters, maskCenterY, radiusOfTopIcon, maskOuterRadius)
    : undefined
  const secondMaskConfig = !isSecondOnTop
    ? createMask(iconCenterBaseX, -1, distanceBetweenCenters, maskCenterY, radiusOfTopIcon, maskOuterRadius)
    : undefined

  const firstIconChildContent = <ProductLogo variant={ProductVariant.CowSwap} height={currentLogoHeight} logoIconOnly />
  const secondIconChildContent = (
    <img src={secondProtocol.logoUrl} width={currentLogoHeight} height={currentLogoHeight} alt={secondProtocol.name} />
  )

  interface StackedIconRenderData {
    id: 'first' | 'second'
    title: string
    bgColor: string | undefined
    zIndex: number
    maskConfig: MaskConfig | undefined
    onMouseEnter: () => void
    iconContent: React.ReactNode
  }

  const stackedIconsData: StackedIconRenderData[] = [
    {
      id: 'first',
      title: 'CoW Swap',
      bgColor: cowSwapBgColor,
      zIndex: firstIconZIndex,
      maskConfig: firstMaskConfig,
      onMouseEnter: handleFirstIconMouseEnter,
      iconContent: firstIconChildContent,
    },
    {
      id: 'second',
      title: secondProtocol.name,
      bgColor: isSecondOnTop ? undefined : 'transparent',
      zIndex: secondIconZIndex,
      maskConfig: secondMaskConfig,
      onMouseEnter: handleSecondIconMouseEnter,
      iconContent: secondIconChildContent,
    },
  ]

  const commonStackedIconProps = {
    size: currentDisplaySize,
    isStacked: true,
    onMouseLeave: handleMouseLeave,
  }

  return (
    <ProtocolIconsContainer iconSize={currentDisplaySize} overlapRatio={STACKED_ICON_OVERLAP_RATIO}>
      {stackedIconsData.map((data) => (
        <ProtocolIcon
          key={data.id}
          title={data.title}
          bgColor={data.bgColor}
          style={{ zIndex: data.zIndex }}
          maskConfig={data.maskConfig}
          onMouseEnter={data.onMouseEnter}
          {...commonStackedIconProps}
        >
          {data.iconContent}
        </ProtocolIcon>
      ))}
    </ProtocolIconsContainer>
  )
})
