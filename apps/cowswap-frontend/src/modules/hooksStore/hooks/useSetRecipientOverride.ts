import { useLayoutEffect } from 'react'

import { useSwapActionHandlers } from 'modules/swap/hooks/useSwapState'
import { useIsHooksTradeType } from 'modules/trade'

import { usePostHooksRecipientOverride } from './usePostHooksRecipientOverride'

export function useSetRecipientOverride() {
  const { onChangeRecipient } = useSwapActionHandlers()
  const hookRecipientOverride = usePostHooksRecipientOverride()
  const isHooksTradeType = useIsHooksTradeType()

  useLayoutEffect(() => {
    if (!hookRecipientOverride || !isHooksTradeType) return

    onChangeRecipient(hookRecipientOverride)
  }, [hookRecipientOverride, isHooksTradeType])
}
