import React, { ReactNode } from 'react'

import SVG from 'react-inlinesvg'

import { Icon, IconType } from '../../../pure/Icon'
import { StatusColorEnums, StatusColorVariant } from '../../../theme/statusColors'

export function renderIcon(
  hideIcon: boolean | undefined,
  customIcon: string | ReactNode | undefined,
  iconSize: number | undefined,
  colorEnums: StatusColorEnums,
  bannerType: StatusColorVariant,
  iconPadding: string
): ReactNode {
  if (hideIcon) return null

  if (customIcon) {
    return typeof customIcon === 'string' ? (
      React.createElement(SVG, { src: customIcon, width: iconSize, height: iconSize })
    ) : (
      customIcon
    )
  }

  if (colorEnums.icon) {
    return React.createElement(Icon, {
      image: colorEnums.icon as IconType,
      size: iconSize,
      color: colorEnums.color,
      description: bannerType,
      padding: iconPadding,
    })
  }

  if (colorEnums.iconText) {
    return React.createElement('i', null, colorEnums.iconText)
  }

  return null
}