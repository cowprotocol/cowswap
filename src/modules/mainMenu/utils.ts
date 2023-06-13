import { MAIN_MENU } from './constants/mainMenu'
import { DropDownItem, MainMenuItemId, MenuItemKind, MenuTreeItem } from './types'

import { Routes } from '../../constants/routes'

const ADVANCED_ORDERS_MENU_TITLE = 'Advanced orders'

export type BuildMainMenuTreeItemsParams = {
  isAdvancedOrdersEnabled: boolean
}

export function buildMainMenuTreeItems({ isAdvancedOrdersEnabled }: BuildMainMenuTreeItemsParams): MenuTreeItem[] {
  if (!isAdvancedOrdersEnabled) {
    return MAIN_MENU
  }

  // Assume trade menu is at the first position
  const [tradeMenu] = MAIN_MENU

  // Check whether this has been added previously
  const notAdded = !(tradeMenu as DropDownItem).items[0].links.find(
    (link) => 'title' in link && link.title === ADVANCED_ORDERS_MENU_TITLE
  )

  if (notAdded) {
    ;(tradeMenu as DropDownItem).items[0].links.push({
      id: MainMenuItemId.ADVANCED_ORDERS,
      kind: MenuItemKind.DYNAMIC_LINK,
      title: ADVANCED_ORDERS_MENU_TITLE,
      url: Routes.ADVANCED_ORDERS,
    })
  }

  return MAIN_MENU
}
