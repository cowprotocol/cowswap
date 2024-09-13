import { useEffect } from 'react'

import { useSwapActionHandlers } from 'modules/swap/hooks/useSwapState'

import { usePostHooksRecipientOverride } from './usePostHooksRecipientOverride'

export function useSetRecipientOverride() {
  const { onChangeRecipient } = useSwapActionHandlers()
  const hookRecipientOverride = usePostHooksRecipientOverride()

  useEffect(() => {
    if (!hookRecipientOverride) return

    onChangeRecipient(hookRecipientOverride)
  }, [hookRecipientOverride])
}
