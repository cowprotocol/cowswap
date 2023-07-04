import { Trans } from '@lingui/macro'
import { matchPath, useLocation } from 'react-router-dom'

import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes, RoutesValues } from 'common/constants/routes'
import { FeatureGuard } from 'common/containers/FeatureGuard'

import * as styledEl from './styled'

export function TradeWidgetLinks() {
  const tradeContext = useTradeRouteContext()
  const location = useLocation()

  const isActiveRoute = (route: RoutesValues) => {
    const routePath = parameterizeTradeRoute(tradeContext, route)
    const match = matchPath(location.pathname, routePath)
    return !!match
  }

  return (
    <styledEl.Wrapper>
      <styledEl.MenuItem isActive={isActiveRoute(Routes.SWAP)}>
        <styledEl.Link to={parameterizeTradeRoute(tradeContext, Routes.SWAP)}>
          <Trans>Swap</Trans>
        </styledEl.Link>
      </styledEl.MenuItem>

      <styledEl.MenuItem isActive={isActiveRoute(Routes.LIMIT_ORDER)}>
        <styledEl.Link to={parameterizeTradeRoute(tradeContext, Routes.LIMIT_ORDER)}>
          <Trans>Limit</Trans>
        </styledEl.Link>
      </styledEl.MenuItem>

      <FeatureGuard featureFlag="advancedOrdersEnabled">
        <styledEl.MenuItem isActive={isActiveRoute(Routes.ADVANCED_ORDERS)}>
          <styledEl.Link to={parameterizeTradeRoute(tradeContext, Routes.ADVANCED_ORDERS)}>
            <Trans>Advanced</Trans>
            <styledEl.Badge>
              <Trans>Beta</Trans>
            </styledEl.Badge>
          </styledEl.Link>
        </styledEl.MenuItem>
      </FeatureGuard>
    </styledEl.Wrapper>
  )
}
