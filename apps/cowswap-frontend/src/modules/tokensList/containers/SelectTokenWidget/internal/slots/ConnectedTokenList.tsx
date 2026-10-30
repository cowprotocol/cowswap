import { ReactNode } from 'react'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { TokenList } from './TokenList'

import { useSelectTokenWidgetState } from '../../../../hooks/useSelectTokenWidgetState'
import { useTokensToSelect } from '../../../../hooks/useTokensToSelect'
import { getTokenSelectorFilter } from '../../../../utils/filterTokensForSelector'

export function ConnectedTokenList(): ReactNode {
  const { isRouteAvailable } = useTokensToSelect()
  const { field } = useSelectTokenWidgetState()
  const tokensFilter = getTokenSelectorFilter(field, useInjectedWidgetParams())

  return <TokenList isRouteAvailable={isRouteAvailable} notice={tokensFilter?.notice} />
}
