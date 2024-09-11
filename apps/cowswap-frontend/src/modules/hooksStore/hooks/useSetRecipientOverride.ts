import { useEffect } from 'react'

import { useSwapActionHandlers } from 'modules/swap/hooks/useSwapState'

import { useHooks } from './useHooks'

// TODO: remove override when needed
export function useSetRecipientOverride() {
  const { onChangeRecipient } = useSwapActionHandlers()
  const { postHooks } = useHooks()
  // TODO: what to do when several hooks have override?
  const hookReceiverOverride = postHooks.reverse().find((i) => i.receiverOverride)?.receiverOverride

  useEffect(() => {
    if (!hookReceiverOverride) return

    onChangeRecipient(hookReceiverOverride)
  }, [hookReceiverOverride])
}
