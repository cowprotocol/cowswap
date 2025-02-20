import { useLayoutEffect } from 'react'

import { useIsHooksTradeType, useIsNativeIn } from 'modules/trade'

import { usePostHooksRecipientOverride } from './usePostHooksRecipientOverride'

import { useSwapWidgetActions } from '../../swap/hooks/useSwapWidgetActions'

export function useSetRecipientOverride() {
  const { onChangeRecipient } = useSwapWidgetActions()
  const hookRecipientOverride = usePostHooksRecipientOverride()
  const isHooksTradeType = useIsHooksTradeType()
  const isNativeIn = useIsNativeIn()

  /**
   * Don't remove isNativeIn from dependencies
   * the hooks should be re-executed when sell token changes from native
   */
  useLayoutEffect(() => {
    if (!hookRecipientOverride || !isHooksTradeType) return

    onChangeRecipient(hookRecipientOverride)
  }, [hookRecipientOverride, isHooksTradeType, isNativeIn, onChangeRecipient])
}
