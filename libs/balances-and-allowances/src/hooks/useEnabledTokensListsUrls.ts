import { useMemo } from 'react'

import { useListsEnabledState, useVirtualLists } from '@cowprotocol/tokens'

// Virtual list sources (e.g. widget-provided `widgetCustomTokens`) are internal identifiers, not
// fetchable URLs. The BalancesWatcher session API only accepts real list URLs, so those must be
// filtered out. Their tokens are still tracked — see `useCustomTokensForChain`.
export function useEnabledTokensListsUrls(): string[] {
  const enabledState = useListsEnabledState()
  const virtualLists = useVirtualLists()

  return useMemo(
    () =>
      Object.entries(enabledState)
        .filter(([source, enabled]) => enabled === true && !virtualLists[source])
        .map(([source]) => source)
        .sort(),
    [enabledState, virtualLists],
  )
}
