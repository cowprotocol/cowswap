import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isLocal } from '@cowprotocol/common-utils'

import { useHooksEnabled } from 'legacy/state/user/hooks'

import { HOOKS_STORE_MENU_ITEM, MENU_ITEMS, IMenuItem, YIELD_MENU_ITEM } from '../constants/routes'

export function useMenuItems(): IMenuItem[] {
  const isHooksEnabled = useHooksEnabled()
  const { isYieldEnabled } = useFeatureFlags()

  return useMemo(() => {
    const items = [...MENU_ITEMS]

    if (isHooksEnabled) {
      items.push(HOOKS_STORE_MENU_ITEM)
    }

    if (isYieldEnabled || isLocal) {
      items.push(YIELD_MENU_ITEM)
    }

    return items
  }, [isHooksEnabled, isYieldEnabled])
}
