import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isLocal, isPr } from '@cowprotocol/common-utils'

import { HOOKS_STORE_MENU_ITEM, MENU_ITEMS, YIELD_MENU_ITEM } from '../constants/routes'

export function useMenuItems() {
  const { isHooksStoreEnabled } = useFeatureFlags()
  const { isYieldEnabled } = useFeatureFlags()

  return useMemo(() => {
    const items = [...MENU_ITEMS]

    if (isHooksStoreEnabled || isLocal) {
      items.push(HOOKS_STORE_MENU_ITEM)
    }

    if (isYieldEnabled || isLocal || isPr) {
      items.push(YIELD_MENU_ITEM)
    }

    return items
  }, [isHooksStoreEnabled, isYieldEnabled])
}
