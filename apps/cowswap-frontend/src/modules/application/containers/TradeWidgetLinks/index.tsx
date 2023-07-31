import { Trans } from '@lingui/macro'
import { matchPath, useLocation } from 'react-router-dom'

import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes, RoutesValues } from 'common/constants/routes'
import { FeatureGuard } from 'common/containers/FeatureGuard'

import * as styledEl from './styled'

interface MenuItemConfig {
  route: RoutesValues
  label: string
  featureGuard?: string
  onClick?: () => void
}

const menuItems: MenuItemConfig[] = [
  { route: Routes.SWAP, label: 'Swap' },
  { route: Routes.LIMIT_ORDER, label: 'Limit' },
  {
    route: Routes.ADVANCED_ORDERS,
    label: 'Advanced',
    featureGuard: 'advancedOrdersEnabled',
  },
]

export function TradeWidgetLinks() {
  const tradeContext = useTradeRouteContext()
  const location = useLocation()

  return (
    <styledEl.Wrapper>
      {menuItems.map((item) => {
        const routePath = parameterizeTradeRoute(tradeContext, item.route)
        const isActive = !!matchPath(location.pathname, routePath)

        const menuItem = <MenuItem key={item.label} routePath={routePath} item={item} isActive={isActive} />

        return item.featureGuard ? (
          <FeatureGuard key={item.label} featureFlag={item.featureGuard}>
            {menuItem}
          </FeatureGuard>
        ) : (
          menuItem
        )
      })}
    </styledEl.Wrapper>
  )
}

const MenuItem = ({ routePath, item, isActive }: { routePath: string; item: MenuItemConfig; isActive: boolean }) => (
  <styledEl.MenuItem isActive={isActive}>
    <styledEl.Link to={routePath}>
      <Trans>{item.label}</Trans>
      {item.featureGuard && (
        <styledEl.Badge>
          <Trans>Beta</Trans>
        </styledEl.Badge>
      )}
    </styledEl.Link>
  </styledEl.MenuItem>
)
