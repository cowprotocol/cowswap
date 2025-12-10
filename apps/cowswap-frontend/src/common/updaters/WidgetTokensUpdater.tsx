/* eslint-disable no-restricted-imports */ // TODO: Don't use 'modules' import
import { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { WidgetTokensListsUpdater } from '@cowprotocol/tokens'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useOnTokenListAddingError } from 'modules/tokensList'

import { CowSwapAnalyticsCategory } from '../analytics/types'

export function WidgetTokensUpdater(): ReactNode {
  const { tokenLists, appCode, customTokens } = useInjectedWidgetParams()
  const onTokenListAddingError = useOnTokenListAddingError()
  const cowAnalytics = useCowAnalytics()

  return (
    <WidgetTokensListsUpdater
      tokenLists={tokenLists}
      customTokens={customTokens}
      appCode={appCode}
      onTokenListAddingError={onTokenListAddingError}
      onAddList={(source) => {
        cowAnalytics.sendEvent({
          category: CowSwapAnalyticsCategory.LIST,
          action: 'Add List Success',
          label: source,
        })
      }}
      onRemoveList={(source) => {
        cowAnalytics.sendEvent({
          category: CowSwapAnalyticsCategory.LIST,
          action: 'Remove List',
          label: source,
        })
      }}
    />
  )
}
