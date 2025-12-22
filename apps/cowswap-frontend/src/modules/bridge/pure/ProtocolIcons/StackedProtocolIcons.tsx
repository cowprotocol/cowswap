import { useState, useMemo, ReactNode } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/sdk-bridging'
import { ProductVariant, ProductLogo, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { ProtocolIcon, ProtocolIconsContainer } from './styled'
import { getBorderWidth } from './utils'

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

// Utility function for mask configuration
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

// Pure function for mask calculations
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

// Stacked Protocol Icons Component
export interface StackedProtocolIconsProps {
  secondProtocol: BridgeProviderInfo
  currentDisplaySize: number
  currentLogoHeight: number
}

export function StackedProtocolIcons({
  secondProtocol,
  currentDisplaySize,
  currentLogoHeight,
}: StackedProtocolIconsProps): ReactNode {
  const { hoveredIcon, handleFirstIconMouseEnter, handleSecondIconMouseEnter, handleMouseLeave } = useIconHoverState()

  const { firstMaskConfig, secondMaskConfig, isFirstOnTop, isSecondOnTop } = useMaskCalculations(
    currentDisplaySize,
    hoveredIcon,
  )

  const cowProtocolBgColor = UI.COLOR_PURPLE_800_PRIMARY
  const firstIconZIndex = isFirstOnTop ? 3 : 1
  const secondIconZIndex = isSecondOnTop ? 3 : isFirstOnTop ? 1 : 2

  const firstIconChildContent = (
    <ProductLogo
      variant={ProductVariant.CowProtocol}
      height={currentLogoHeight}
      logoIconOnly
      overrideColor={`var(${UI.COLOR_PURPLE_200_PRIMARY})`}
      overrideHoverColor={`var(${UI.COLOR_PURPLE_200_PRIMARY})`}
    />
  )
  const secondIconChildContent = (
    <img src={secondProtocol.logoUrl} width={currentLogoHeight} height={currentLogoHeight} alt={secondProtocol.name} />
  )

  const commonStackedIconProps = {
    size: currentDisplaySize,
    isStacked: true,
    onMouseLeave: handleMouseLeave,
  }

  return (
    <ProtocolIconsContainer iconSize={currentDisplaySize} overlapRatio={STACKED_ICON_OVERLAP_RATIO}>
      <ProtocolIcon
        key="first"
        title={t`CoW Protocol`}
        bgColor={cowProtocolBgColor}
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
}
