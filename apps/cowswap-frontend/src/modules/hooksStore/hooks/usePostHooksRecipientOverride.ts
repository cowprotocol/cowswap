import { useMemo } from 'react'

import { useHooks } from './useHooks'

export function usePostHooksRecipientOverride() {
  const { postHooks } = useHooks()

  return useMemo(() => postHooks.reverse().find((i) => i.receiverOverride)?.receiverOverride, [postHooks])
}
