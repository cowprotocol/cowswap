import { useLayoutEffect } from 'react'

import { useSwapActionHandlers } from 'modules/swap/hooks/useSwapState'
import { useIsHooksTradeType, useIsNativeIn } from 'modules/trade'

import { usePostHooksRecipientOverride } from './usePostHooksRecipientOverride'

export function useSetRecipientOverride() {
  const { onChangeRecipient } = useSwapActionHandlers()
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
