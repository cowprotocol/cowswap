import { useMemo } from 'react'

import { isHttpUrl } from '@cowprotocol/common-utils'
import { useListsEnabledState } from '@cowprotocol/tokens'

export function useEnabledTokensListsUrls(): string[] {
  const enabledState = useListsEnabledState()

  return useMemo(
    () =>
      Object.entries(enabledState)
        .filter(([source, enabled]) => enabled === true && isHttpUrl(source))
        .map(([source]) => source)
        .sort(),
    [enabledState],
  )
}
