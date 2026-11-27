import { ReactNode } from 'react'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { TokenList } from './TokenList'

import { useSelectTokenWidgetState } from '../../../../hooks/useSelectTokenWidgetState'
import { useTokensToSelect } from '../../../../hooks/useTokensToSelect'
import { getTokenSelectorFilter } from '../../../../utils/filterTokensForSelector'

export function ConnectedTokenList(): ReactNode {
  const { isRouteAvailable, areTokensFromBridge, isLoading, tokens } = useTokensToSelect()
  const { field } = useSelectTokenWidgetState()
  const tokensFilter = getTokenSelectorFilter(field, useInjectedWidgetParams())
  const areFilteredTokensNotBridgeable = Boolean(
    areTokensFromBridge && tokensFilter?.tokens && !isLoading && tokens.length === 0,
  )

  return (
    <TokenList
      isRouteAvailable={isRouteAvailable}
      areFilteredTokensNotBridgeable={areFilteredTokensNotBridgeable}
      notice={tokensFilter?.notice}
    />
  )
}
