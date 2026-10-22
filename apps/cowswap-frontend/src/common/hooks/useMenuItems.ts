import { useCallback } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getIsSafeAppIframe, isInjectedWidget } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import { useHooksEnabled } from 'legacy/state/user/hooks'

import {
  HOOKS_STORE_MENU_ITEM,
  MENU_ITEMS,
  IMenuItem,
  I18nIMenuItem,
  RWA_MENU_ITEM,
  YIELD_MENU_ITEM,
} from '../constants/routes'

export function useMenuItems(): IMenuItem[] {
  const isHooksEnabled = useHooksEnabled()
  const { isYieldEnabled, isRwaEnabled } = useFeatureFlags()
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

  if (isYieldEnabled) {
    items.push(extractMenuItem(YIELD_MENU_ITEM))
  }

  if (isRwaEnabled && !isInjectedWidget() && !getIsSafeAppIframe()) {
    items.push(extractMenuItem(RWA_MENU_ITEM))
  }

  return items
}
