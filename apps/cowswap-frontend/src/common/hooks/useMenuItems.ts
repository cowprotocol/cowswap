import { useCallback } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isLocal } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import { useHooksEnabled } from 'legacy/state/user/hooks'

import { HOOKS_STORE_MENU_ITEM, MENU_ITEMS, IMenuItem, I18nIMenuItem, YIELD_MENU_ITEM } from '../constants/routes'

export function useMenuItems(): IMenuItem[] {
  const isHooksEnabled = useHooksEnabled()
  const { isYieldEnabled } = useFeatureFlags()
  const { i18n } = useLingui()

  const extractMenuItem = useCallback(
    (item: I18nIMenuItem): IMenuItem => {
      const { label, fullLabel, description, badge, ...restProps } = item

      return {
        label: i18n._(label),
        fullLabel: fullLabel ? i18n._(fullLabel) : undefined,
        description: i18n._(description),
        badge: badge ? i18n._(badge) : undefined,
        ...restProps,
      }
    },
    [i18n],
  )

  const items: IMenuItem[] = MENU_ITEMS.map((item) => extractMenuItem(item))

  if (isHooksEnabled) {
    items.push(extractMenuItem(HOOKS_STORE_MENU_ITEM))
  }

  if (isYieldEnabled || isLocal) {
    items.push(extractMenuItem(YIELD_MENU_ITEM))
  }

  return items
}
