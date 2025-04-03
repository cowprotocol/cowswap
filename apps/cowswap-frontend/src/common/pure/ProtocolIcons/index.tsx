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

export function ProtocolIcons({ secondProtocol, showOnlyFirst, showOnlySecond, size }: ProtocolIconsProps) {
  // If showing only first or only second, use the specified size or default to 36px for single icons
  const iconSize = showOnlyFirst || showOnlySecond ? size || 36 : size

  const logoHeight = iconSize ? iconSize * 0.75 : DEFAULT_ICON_SIZE

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
    if (!secondProtocol) {
      console.error('secondProtocol is required when showOnlySecond is true')
      return null
    }
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
          height={DEFAULT_ICON_SIZE}
          logoIconOnly
          overrideColor={`var(${UI.COLOR_BLUE_300_PRIMARY})`}
          overrideHoverColor={`var(${UI.COLOR_BLUE_300_PRIMARY})`}
        />
      </ProtocolIcon>
      <ProtocolIcon title={secondProtocol.title}>
        <img
          src={secondProtocol.icon}
          width={secondProtocol.width || DEFAULT_ICON_SIZE}
          height={secondProtocol.height || DEFAULT_ICON_SIZE}
          alt={secondProtocol.title}
        />
      </ProtocolIcon>
    </ProtocolIconsContainer>
  )
}
