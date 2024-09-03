import { useMemo } from 'react'

import { HOOKS_STORE_MENU_ITEM, MENU_ITEMS } from '../constants/routes'

export function useMenuItems() {
  return useMemo(() => {
    return MENU_ITEMS.concat(HOOKS_STORE_MENU_ITEM)
  }, [])
}
