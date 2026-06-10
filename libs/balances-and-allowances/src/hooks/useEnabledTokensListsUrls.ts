import { useListsEnabledState } from '@cowprotocol/tokens'

import { useStableStringArray } from './useStableStringArray'

/**
 * Returns the sorted URLs of token lists currently enabled by the user.
 * Identity is stable across renders unless the set of enabled URLs changes.
 */
export function useEnabledTokensListsUrls(): string[] {
  const enabledState = useListsEnabledState()
  const computed = Object.entries(enabledState)
    .filter(([, enabled]) => enabled === true)
    .map(([source]) => source)
    .sort()
  return useStableStringArray(computed)
}
