import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isLocal } from '@cowprotocol/common-utils'

import { HOOKS_STORE_MENU_ITEM, MENU_ITEMS } from '../constants/routes'

export function useMenuItems() {
  const { isHooksStoreEnabled } = useFeatureFlags()

  return useMemo(() => {
    return isHooksStoreEnabled || isLocal ? MENU_ITEMS.concat(HOOKS_STORE_MENU_ITEM) : MENU_ITEMS
  }, [isHooksStoreEnabled])
}
