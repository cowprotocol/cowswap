import { useMemo } from 'react'

import { useHooks } from './useHooks'

export function usePostHooksRecipientOverride(): string | undefined {
  const { postHooks } = useHooks()

  /**
   * TODO: need to add a validation and warnings
   * because in the current implementation we always take the value from the last hook
   * but it might give an unexpected behaviour
   */
  return useMemo(() => postHooks.reverse().find((i) => i.recipientOverride)?.recipientOverride, [postHooks])
}
