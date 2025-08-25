import { ReactNode } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/sdk-bridging'
import { ProductVariant, ProductLogo, UI } from '@cowprotocol/ui'

import { StackedProtocolIcons } from './StackedProtocolIcons'
import { ProtocolIcon } from './styled'

import { COW_PROTOCOL_NAME } from '../../constants'

export interface ProtocolIconsProps {
  secondProtocol?: BridgeProviderInfo
  showOnlyFirst?: boolean
  showOnlySecond?: boolean
  size?: number
}

const DEFAULT_ICON_SIZE = 18 // For stacked icons
const DEFAULT_SINGLE_ICON_SIZE = 36 // For showOnlyFirst
const LOGO_HEIGHT_RATIO = 0.5 // The ratio of the icon size to the logo height

// Single Protocol Icon Component
interface SingleProtocolIconProps {
  showOnlyFirst?: boolean
  secondProtocol?: BridgeProviderInfo
  currentDisplaySize: number
  currentLogoHeight: number
}

function SingleProtocolIcon({
  showOnlyFirst,
  secondProtocol,
  currentDisplaySize,
  currentLogoHeight,
}: SingleProtocolIconProps): ReactNode {
  const protocolName = showOnlyFirst ? COW_PROTOCOL_NAME : secondProtocol?.name
  const protocolBgColor = showOnlyFirst ? UI.COLOR_PURPLE_800_PRIMARY : undefined
  const iconChild = showOnlyFirst ? (
    <ProductLogo
      variant={ProductVariant.CowProtocol}
      height={currentLogoHeight}
      logoIconOnly
      overrideColor={`var(${UI.COLOR_PURPLE_200_PRIMARY})`}
      overrideHoverColor={`var(${UI.COLOR_PURPLE_200_PRIMARY})`}
    />
  ) : (
    <img
      src={secondProtocol?.logoUrl}
      width={currentLogoHeight}
      height={currentLogoHeight}
      alt={secondProtocol?.name}
    />
  )

  return (
    <ProtocolIcon
      title={protocolName}
      size={currentDisplaySize}
      isStacked={false}
      bgColor={protocolBgColor}
      color={showOnlyFirst ? `var(${UI.COLOR_PURPLE_200_PRIMARY})` : undefined}
    >
      {iconChild}
    </ProtocolIcon>
  )
}

export function ProtocolIcons({
  secondProtocol,
  showOnlyFirst,
  showOnlySecond,
  size = DEFAULT_ICON_SIZE,
}: ProtocolIconsProps): ReactNode {
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

  if (secondProtocol) {
    return (
      <StackedProtocolIcons
        secondProtocol={secondProtocol}
        currentDisplaySize={currentDisplaySize}
        currentLogoHeight={currentLogoHeight}
      />
    )
  }

  return null
}
