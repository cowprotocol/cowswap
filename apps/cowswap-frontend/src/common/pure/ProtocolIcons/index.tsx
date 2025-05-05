import { ProductVariant, UI, ProductLogo } from '@cowprotocol/ui'

import { ProtocolIcon, ProtocolIconsContainer } from './styled'

export interface SecondProtocolConfig {
  icon: string
  title: string
  width?: number
  height?: number
}

export interface ProtocolIconsProps {
  secondProtocol: SecondProtocolConfig
  showOnlyFirst?: boolean
  showOnlySecond?: boolean
  size?: number
}

const DEFAULT_ICON_SIZE = 18
const DEFAULT_SINGLE_ICON_SIZE = 36
const LOGO_HEIGHT_RATIO = 0.75

export function ProtocolIcons({
  secondProtocol,
  showOnlyFirst,
  showOnlySecond,
  size = DEFAULT_ICON_SIZE, // Default size for stacked icons
}: ProtocolIconsProps) {
  // If showing only first or only second, use the specified size or default single icon size
  const iconSize =
    showOnlyFirst || showOnlySecond ? (size === DEFAULT_ICON_SIZE ? DEFAULT_SINGLE_ICON_SIZE : size) : size

  const logoHeight = iconSize ? iconSize * LOGO_HEIGHT_RATIO : DEFAULT_ICON_SIZE * LOGO_HEIGHT_RATIO

  if (showOnlyFirst) {
    return (
      <ProtocolIcon bgColor={UI.COLOR_BLUE_900_PRIMARY} title="CoW Protocol" size={iconSize}>
        <ProductLogo
          variant={ProductVariant.CowProtocol}
          height={logoHeight}
          logoIconOnly
          overrideColor={`var(${UI.COLOR_BLUE_300_PRIMARY})`}
          overrideHoverColor={`var(${UI.COLOR_BLUE_300_PRIMARY})`}
        />
      </ProtocolIcon>
    )
  }

  if (showOnlySecond) {
    return (
      <ProtocolIcon title={secondProtocol.title} size={iconSize}>
        <img
          src={secondProtocol.icon}
          width={secondProtocol.width || logoHeight}
          height={secondProtocol.height || logoHeight}
          alt={secondProtocol.title}
        />
      </ProtocolIcon>
    )
  }

  return (
    <ProtocolIconsContainer iconSize={size}>
      <ProtocolIcon bgColor={UI.COLOR_BLUE_900_PRIMARY} title="Cow Protocol">
        <ProductLogo
          variant={ProductVariant.CowProtocol}
          height={DEFAULT_ICON_SIZE * LOGO_HEIGHT_RATIO}
          logoIconOnly
          overrideColor={`var(${UI.COLOR_BLUE_300_PRIMARY})`}
          overrideHoverColor={`var(${UI.COLOR_BLUE_300_PRIMARY})`}
        />
      </ProtocolIcon>
      <ProtocolIcon title={secondProtocol.title}>
        <img
          src={secondProtocol.icon}
          width={secondProtocol.width || DEFAULT_ICON_SIZE * LOGO_HEIGHT_RATIO}
          height={secondProtocol.height || DEFAULT_ICON_SIZE * LOGO_HEIGHT_RATIO}
          alt={secondProtocol.title}
        />
      </ProtocolIcon>
    </ProtocolIconsContainer>
  )
}
