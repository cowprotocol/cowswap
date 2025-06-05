import React, { useState, memo, useMemo, ReactNode } from 'react'

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

enum IconPosition {
  FIRST = 'first',
  SECOND = 'second',
}

interface MaskConfig {
  cx: number
  cy: number
  innerR: number
  outerR: number
}

interface IconHoverState {
  hoveredIcon: IconPosition | null
  handleFirstIconMouseEnter: () => void
  handleSecondIconMouseEnter: () => void
  handleMouseLeave: () => void
}

interface MaskCalculationResult {
  firstMaskConfig: MaskConfig | undefined
  secondMaskConfig: MaskConfig | undefined
  isFirstOnTop: boolean
  isSecondOnTop: boolean
}

// Custom hook for hover state management
function useIconHoverState(): IconHoverState {
  const [hoveredIcon, setHoveredIcon] = useState<IconPosition | null>(null)

  const handleFirstIconMouseEnter = (): void => setHoveredIcon(IconPosition.FIRST)
  const handleSecondIconMouseEnter = (): void => setHoveredIcon(IconPosition.SECOND)
  const handleMouseLeave = (): void => setHoveredIcon(null)

  return {
    hoveredIcon,
    handleFirstIconMouseEnter,
    handleSecondIconMouseEnter,
    handleMouseLeave,
  }
}

// Utility function for mask configuration - pure and optimized
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
  innerR,
  outerR,
})

// Pure function for mask calculations - optimized for performance
function calculateMask(currentDisplaySize: number, hoveredIcon: IconPosition | null): MaskCalculationResult {
  const cutThickness = getBorderWidth(currentDisplaySize)
  const radiusOfTopIcon = currentDisplaySize / 2
  const maskOuterRadius = radiusOfTopIcon + cutThickness
  const maskCenterY = currentDisplaySize / 2
  const iconCenterBaseX = currentDisplaySize / 2
  const distanceBetweenCenters = currentDisplaySize * (1 - STACKED_ICON_OVERLAP_RATIO)

  const isFirstHovered = hoveredIcon === IconPosition.FIRST
  const isSecondHovered = hoveredIcon === IconPosition.SECOND
  const isFirstOnTop = isFirstHovered
  const isSecondOnTop = isSecondHovered || (!isFirstHovered && !isSecondHovered)

  const firstMaskConfig = !isFirstOnTop
    ? createMask(iconCenterBaseX, 1, distanceBetweenCenters, maskCenterY, radiusOfTopIcon, maskOuterRadius)
    : undefined
  const secondMaskConfig = !isSecondOnTop
    ? createMask(iconCenterBaseX, -1, distanceBetweenCenters, maskCenterY, radiusOfTopIcon, maskOuterRadius)
    : undefined

  return {
    firstMaskConfig,
    secondMaskConfig,
    isFirstOnTop,
    isSecondOnTop,
  }
}

// Custom hook for mask calculations. Memoized only for costly computation.
function useMaskCalculations(currentDisplaySize: number, hoveredIcon: IconPosition | null): MaskCalculationResult {
  return useMemo(() => calculateMask(currentDisplaySize, hoveredIcon), [currentDisplaySize, hoveredIcon])
}

// Single Protocol Icon Component
interface SingleProtocolIconProps {
  showOnlyFirst?: boolean
  secondProtocol: BridgeProviderInfo
  currentDisplaySize: number
  currentLogoHeight: number
}

const SingleProtocolIcon = memo(function SingleProtocolIcon({
  showOnlyFirst,
  secondProtocol,
  currentDisplaySize,
  currentLogoHeight,
}: SingleProtocolIconProps): ReactNode {
  const protocolName = showOnlyFirst ? 'CoW Swap' : secondProtocol.name
  const protocolBgColor = showOnlyFirst ? UI.COLOR_BLUE_300_PRIMARY : undefined
  const iconChild = showOnlyFirst ? (
    <ProductLogo variant={ProductVariant.CowSwap} height={currentLogoHeight} logoIconOnly />
  ) : (
    <img src={secondProtocol.logoUrl} width={currentLogoHeight} height={currentLogoHeight} alt={secondProtocol.name} />
  )

  return (
    <ProtocolIcon title={protocolName} size={currentDisplaySize} isStacked={false} bgColor={protocolBgColor}>
      {iconChild}
    </ProtocolIcon>
  )
})

// Stacked Protocol Icons Component
interface StackedProtocolIconsProps {
  secondProtocol: BridgeProviderInfo
  currentDisplaySize: number
  currentLogoHeight: number
}

const StackedProtocolIcons = memo(function StackedProtocolIcons({
  secondProtocol,
  currentDisplaySize,
  currentLogoHeight,
}: StackedProtocolIconsProps): React.JSX.Element {
  const { hoveredIcon, handleFirstIconMouseEnter, handleSecondIconMouseEnter, handleMouseLeave } = useIconHoverState()

  const { firstMaskConfig, secondMaskConfig, isFirstOnTop, isSecondOnTop } = useMaskCalculations(
    currentDisplaySize,
    hoveredIcon,
  )

  const cowSwapBgColor = UI.COLOR_BLUE_300_PRIMARY
  const firstIconZIndex = isFirstOnTop ? 3 : 1
  const secondIconZIndex = isSecondOnTop ? 3 : isFirstOnTop ? 1 : 2

  const firstIconChildContent = <ProductLogo variant={ProductVariant.CowSwap} height={currentLogoHeight} logoIconOnly />
  const secondIconChildContent = (
    <img src={secondProtocol.logoUrl} width={currentLogoHeight} height={currentLogoHeight} alt={secondProtocol.name} />
  )

  const commonStackedIconProps = {
    size: currentDisplaySize,
    isStacked: true as const,
    onMouseLeave: handleMouseLeave,
  }

  return (
    <ProtocolIconsContainer iconSize={currentDisplaySize} overlapRatio={STACKED_ICON_OVERLAP_RATIO}>
      <ProtocolIcon
        key="first"
        title="CoW Swap"
        bgColor={cowSwapBgColor}
        style={{ zIndex: firstIconZIndex }}
        maskConfig={firstMaskConfig}
        onMouseEnter={handleFirstIconMouseEnter}
        {...commonStackedIconProps}
      >
        {firstIconChildContent}
      </ProtocolIcon>
      <ProtocolIcon
        key="second"
        title={secondProtocol.name}
        bgColor={isSecondOnTop ? undefined : 'transparent'}
        style={{ zIndex: secondIconZIndex }}
        maskConfig={secondMaskConfig}
        onMouseEnter={handleSecondIconMouseEnter}
        {...commonStackedIconProps}
      >
        {secondIconChildContent}
      </ProtocolIcon>
    </ProtocolIconsContainer>
  )
})

// Main component
export const ProtocolIcons = memo(function ProtocolIcons({
  secondProtocol,
  showOnlyFirst,
  showOnlySecond,
  size = DEFAULT_ICON_SIZE,
}: ProtocolIconsProps): React.JSX.Element {
  const isSingleIconDisplay = !!(showOnlyFirst || showOnlySecond)
  const currentDisplaySize = isSingleIconDisplay ? (size === DEFAULT_ICON_SIZE ? DEFAULT_SINGLE_ICON_SIZE : size) : size
  const currentLogoHeight = currentDisplaySize * LOGO_HEIGHT_RATIO

  if (isSingleIconDisplay) {
    return (
      <SingleProtocolIcon
        showOnlyFirst={showOnlyFirst}
        secondProtocol={secondProtocol}
        currentDisplaySize={currentDisplaySize}
        currentLogoHeight={currentLogoHeight}
      />
    )
  }

  return (
    <StackedProtocolIcons
      secondProtocol={secondProtocol}
      currentDisplaySize={currentDisplaySize}
      currentLogoHeight={currentLogoHeight}
    />
  )
})
