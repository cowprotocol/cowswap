import { useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ListState, useAddList, useAddUserToken } from '@cowprotocol/tokens'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

export interface TokenAdminActions {
  addCustomTokenLists(list: ListState): void
  importTokenCallback(tokens: TokenWithLogo[]): void
}

export function useTokenAdminActions(): TokenAdminActions {
  const cowAnalytics = useCowAnalytics()

  const addCustomTokenLists = useAddList((source) => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.LIST,
      action: 'Add List Success',
      label: source,
    })
  })
  const importTokenCallback = useAddUserToken()

  return useMemo(() => ({ addCustomTokenLists, importTokenCallback }), [addCustomTokenLists, importTokenCallback])
}
