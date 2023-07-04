import React from 'react'

import { Trans } from '@lingui/macro'
import { matchPath, useLocation } from 'react-router-dom'

import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes, RoutesValues } from 'common/constants/routes'
import { FeatureGuard } from 'common/containers/FeatureGuard'

import * as styledEl from './styled'

const menuItems = [
  { route: Routes.SWAP, label: 'Swap', isFeatureGuarded: false },
  { route: Routes.LIMIT_ORDER, label: 'Limit', isFeatureGuarded: false },
  { route: Routes.ADVANCED_ORDERS, label: 'Advanced', isFeatureGuarded: true },
]

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
      {menuItems.map((item) =>
        item.isFeatureGuarded ? (
          <FeatureGuard featureFlag="advancedOrdersEnabled">
            <MenuItem item={item} isActive={isActiveRoute(item.route)} context={tradeContext} />
          </FeatureGuard>
        ) : (
          <MenuItem item={item} isActive={isActiveRoute(item.route)} context={tradeContext} />
        )
      )}
    </styledEl.Wrapper>
  )
}

const MenuItem = ({ item, isActive, context }: { item: any; isActive: boolean; context: any }) => (
  <styledEl.MenuItem isActive={isActive}>
    <styledEl.Link to={parameterizeTradeRoute(context, item.route)}>
      <Trans>{item.label}</Trans>
      {item.isFeatureGuarded && (
        <styledEl.Badge>
          <Trans>Beta</Trans>
        </styledEl.Badge>
      )}
    </styledEl.Link>
  </styledEl.MenuItem>
)
