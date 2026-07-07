import { useMemo } from 'react'

import { useListsEnabledState } from '@cowprotocol/tokens'

export function useEnabledTokensListsUrls(): string[] {
  const enabledState = useListsEnabledState()

  return useMemo(
    () =>
      Object.entries(enabledState)
        .filter(([, enabled]) => enabled === true)
        .map(([source]) => source)
        .sort(),
    [enabledState],
  )
}
