import { TradeStateFromUrl } from '@cow/modules/trade/types/TradeState'
import { Routes } from '@cow/constants/routes'

export enum MenuItemKind {
  DROP_DOWN = 'DROP_DOWN',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
  DARK_MODE_BUTTON = 'DARK_MODE_BUTTON',
  DYNAMIC_LINK = 'DYNAMIC_LINK',
}

export enum MainMenuItemId {
  SWAP = 'SWAP',
  LIMIT_ORDERS = 'LIMIT_ORDERS',
  FAQ_OVERVIEW = 'FAQ_OVERVIEW',
  FAQ_PROTOCOL = 'FAQ_PROTOCOL',
  FAQ_TOKEN = 'FAQ_TOKEN',
  FAQ_TRADING = 'FAQ_TRADING',
  FAQ_AFFILIATE = 'FAQ_AFFILIATE',
  FAQ_LIMIT_ORDERS = 'FAQ_LIMIT_ORDERS',
  ACCOUNT_OVERVIEW = 'ACCOUNT_OVERVIEW',
  ACCOUNT_TOKENS = 'ACCOUNT_TOKENS',
  MORE_DOCUMENTATION = 'MORE_DOCUMENTATION',
  MORE_ABOUT = 'MORE_ABOUT',
  MORE_STATISTICS = 'MORE_STATISTICS',
  MORE_CONTRACT = 'MORE_CONTRACT',
  MORE_DISCORD = 'MORE_DISCORD',
  MORE_TWITTER = 'MORE_TWITTER',
  OTHER_COW_RUNNER = 'OTHER_COW_RUNNER',
  OTHER_MEV_SLICER = 'OTHER_MEV_SLICER',
  OTHER_TERMS_AND_CONDITIONS = 'OTHER_TERMS_AND_CONDITIONS',
}

export interface BasicMenuLink {
  id: MainMenuItemId
  title: string
  url: string
  icon?: string // If icon uses a regular <img /> tag
  iconSVG?: string // If icon is a <SVG> inline component
}

export interface InternalLink extends BasicMenuLink {
  kind?: undefined
}

export interface ExternalLink extends BasicMenuLink {
  kind: MenuItemKind.EXTERNAL_LINK
}
export interface DynamicLink extends BasicMenuLink {
  kind: MenuItemKind.DYNAMIC_LINK
  url: Routes
}

export type DarkModeLink = { kind: MenuItemKind.DARK_MODE_BUTTON }
export type MenuLink = InternalLink | ExternalLink | DarkModeLink | DynamicLink

export interface DropDownSubItem {
  sectionTitle?: string
  links: MenuLink[]
}

export interface DropDownItem {
  kind: MenuItemKind.DROP_DOWN
  title: string
  items: DropDownSubItem[]
}

export type MenuTreeItem = InternalLink | ExternalLink | DropDownItem | DynamicLink

export interface MainMenuContext {
  darkMode: boolean
  toggleDarkMode: () => void
  handleMobileMenuOnClick: () => void
  tradeContext: TradeStateFromUrl
}
