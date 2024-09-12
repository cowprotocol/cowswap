import { useEffect } from 'react'

import { useSwapActionHandlers } from 'modules/swap/hooks/useSwapState'

import { usePostHooksRecipientOverride } from './usePostHooksRecipientOverride'

export function useSetRecipientOverride() {
  const { onChangeRecipient } = useSwapActionHandlers()
  const hookReceiverOverride = usePostHooksRecipientOverride()

  useEffect(() => {
    if (!hookReceiverOverride) return

    onChangeRecipient(hookReceiverOverride)
  }, [hookReceiverOverride])
}
