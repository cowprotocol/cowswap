import { ReactNode } from 'react'

import SVG from 'react-inlinesvg'

import { Icon, IconType } from '../../../pure/Icon'
import { StatusColorEnums, StatusColorVariant } from '../../../theme/statusColors'

interface BannerIconProps {
  hideIcon?: boolean
  customIcon?: string | ReactNode
  iconSize?: number
  colorEnums: StatusColorEnums
  bannerType: StatusColorVariant
  iconPadding: string
}

export function BannerIcon({
  hideIcon,
  customIcon,
  iconSize,
  colorEnums,
  bannerType,
  iconPadding,
}: BannerIconProps): ReactNode {
  if (hideIcon) return null

  if (customIcon) {
    return typeof customIcon === 'string' ? <SVG src={customIcon} width={iconSize} height={iconSize} /> : customIcon
  }

  if (colorEnums.icon) {
    return (
      <Icon
        image={colorEnums.icon as IconType}
        size={iconSize}
        color={colorEnums.color}
        description={bannerType}
        padding={iconPadding}
      />
    )
  }

  if (colorEnums.iconText) {
    return <i>{colorEnums.iconText}</i>
  }

  return null
}
