import { useMemo } from 'react'

import { useHooks } from './useHooks'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePostHooksRecipientOverride() {
  const { postHooks } = useHooks()

  /**
   * TODO: need to add a validation and warnings
   * because in the current implementation we always take the value from the last hook
   * but it might give an unexpected behaviour
   */
  return useMemo(() => postHooks.reverse().find((i) => i.recipientOverride)?.recipientOverride, [postHooks])
}
