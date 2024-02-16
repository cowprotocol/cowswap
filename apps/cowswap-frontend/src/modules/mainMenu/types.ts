import { Command } from '@cowprotocol/types'

import { TradeUrlParams } from 'modules/trade/types/TradeRawState'

import { RoutesValues } from 'common/constants/routes'

export enum MenuItemKind {
  DROP_DOWN = 'DROP_DOWN',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
  DARK_MODE_BUTTON = 'DARK_MODE_BUTTON',
  PARAMETRIZED_LINK = 'PARAMETRIZED_LINK',
  CUSTOM_ITEM = 'CUSTOM_ITEM',
}

export enum MainMenuItemId {
  SWAP = 'SWAP',
  LIMIT_ORDERS = 'LIMIT_ORDERS',
  ADVANCED_ORDERS = 'ADVANCED_ORDERS',
  FAQ_OVERVIEW = 'FAQ_OVERVIEW',
  FAQ_PROTOCOL = 'FAQ_PROTOCOL',
  FAQ_TOKEN = 'FAQ_TOKEN',
  FAQ_TRADING = 'FAQ_TRADING',
  FAQ_AFFILIATE = 'FAQ_AFFILIATE',
  FAQ_LIMIT_ORDERS = 'FAQ_LIMIT_ORDERS',
  FAQ_ETH_FLOW = 'FAQ_ETH_FLOW',
  ACCOUNT_OVERVIEW = 'ACCOUNT_OVERVIEW',
  ACCOUNT_TOKENS = 'ACCOUNT_TOKENS',
  MORE_DOCUMENTATION = 'MORE_DOCUMENTATION',
  MORE_ABOUT = 'MORE_ABOUT',
  MORE_EXPLORER = 'MORE_EXPLORER',
  MORE_STATISTICS = 'MORE_STATISTICS',
  MORE_CONTRACT = 'MORE_CONTRACT',
  MORE_DISCORD = 'MORE_DISCORD',
  MORE_TWITTER = 'MORE_TWITTER',
  OTHER_COW_RUNNER = 'OTHER_COW_RUNNER',
  OTHER_MEV_SLICER = 'OTHER_MEV_SLICER',
  OTHER_TERMS_AND_CONDITIONS = 'OTHER_TERMS_AND_CONDITIONS',
  OTHER_COOKIE_POLICY = 'OTHER_COOKIE_POLICY',
  OTHER_PRIVACY_POLICY = 'OTHER_PRIVACY_POLICY',
  WIDGET = 'WIDGET',
}

export interface BasicMenuLink {
  id: MainMenuItemId
  title: string
  url: string
  icon?: string // If icon uses a regular <img /> tag
  iconSVG?: string
  badge?: string
}

export interface InternalLink extends BasicMenuLink {
  kind?: undefined
}

export interface ExternalLink extends BasicMenuLink {
  kind: MenuItemKind.EXTERNAL_LINK
}
export interface ParametrizedLink extends BasicMenuLink {
  kind: MenuItemKind.PARAMETRIZED_LINK
  url: RoutesValues
}

export interface CustomItem {
  kind: MenuItemKind.CUSTOM_ITEM
  Item: () => React.ReactNode
}

export type DarkModeLink = { kind: MenuItemKind.DARK_MODE_BUTTON }
export type MenuLink = InternalLink | ExternalLink | DarkModeLink | ParametrizedLink | CustomItem

export interface DropDownSubItem {
  sectionTitle?: string
  links: MenuLink[]
}

export interface DropDownItem {
  kind: MenuItemKind.DROP_DOWN
  title: string
  items: DropDownSubItem[]
  badge?: string
}

export type MenuTreeItem = InternalLink | ExternalLink | DropDownItem | ParametrizedLink | CustomItem
export interface MainMenuContext {
  darkMode: boolean
  toggleDarkMode: Command
  handleMobileMenuOnClick: Command
  tradeContext: TradeUrlParams
}
