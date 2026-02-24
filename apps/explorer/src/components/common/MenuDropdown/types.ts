import type { ComponentType, SVGProps } from 'react'

export type MenuIconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>

export interface BasicMenuLink {
  title: string
  url: string
  icon?: string // If icon uses a regular <img /> tag
  iconSVG?: string // If icon is a <SVG> inline component
  iconComponent?: MenuIconComponent
}

export interface MenuInternalLink extends BasicMenuLink {
  kind?: undefined
}
export interface MenuExternalLink extends BasicMenuLink {
  kind: MenuItemKind.EXTERNAL_LINK
}

export type MenuLink = MenuInternalLink | MenuExternalLink

export interface DropDownSubItem {
  sectionTitle?: string
  links: MenuLink[]
}

export interface DropDownItem {
  kind: MenuItemKind.DROP_DOWN
  title: string
  items: DropDownSubItem[]
}

export interface MenuImageProps {
  title: string
  iconSVG?: string
  icon?: string
  iconComponent?: MenuIconComponent
}

export enum MenuItemKind {
  DROP_DOWN = 'DROP_DOWN',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
  DARK_MODE_BUTTON = 'DARK_MODE_BUTTON',
}

export type MenuTreeItem = MenuInternalLink | MenuExternalLink | DropDownItem
