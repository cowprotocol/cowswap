import { useCallback } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isTruthy } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import { useHooksEnabled } from 'legacy/state/user/hooks'

import { useShouldEnableBridging } from './featureFlags/useShouldEnableBridging'

import {
  HOOKS_STORE_MENU_ITEM,
  IMenuItem,
  I18nIMenuItem,
  YIELD_MENU_ITEM,
  BRIDGING_MENU_ITEM,
  SWAP_MENU_ITEM,
  LIMIT_MENU_ITEM,
  ADVANCED_MENU_ITEM,
} from '../constants/routes'

export function useMenuItems(): IMenuItem[] {
  const isHooksEnabled = useHooksEnabled()
  const { isYieldEnabled } = useFeatureFlags()
  const shouldEnableBridging = useShouldEnableBridging()
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

  return [
    SWAP_MENU_ITEM,
    shouldEnableBridging ? BRIDGING_MENU_ITEM : null,
    LIMIT_MENU_ITEM,
    ADVANCED_MENU_ITEM,
    isHooksEnabled ? HOOKS_STORE_MENU_ITEM : null,
    isYieldEnabled ? YIELD_MENU_ITEM : null,
  ]
    .filter(isTruthy)
    .map(extractMenuItem)
}
