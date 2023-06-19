import { Trans } from '@lingui/macro'

import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { FeatureGuard } from 'common/containers/FeatureGuard'
import { isInjectedWidget } from 'common/utils/isInjectedWidget'
import { Routes } from 'constants/routes'

import * as styledEl from './styled'

export function TradeWidgetLinks() {
  const tradeContext = useTradeRouteContext()

  const swapItem = (
    <styledEl.MenuItem>
      <styledEl.Link
        className={({ isActive }) => (isActive ? 'active' : undefined)}
        to={parameterizeTradeRoute(tradeContext, Routes.SWAP)}
      >
        <Trans>Swap</Trans>
      </styledEl.Link>
    </styledEl.MenuItem>
  )

  return (
    <styledEl.Wrapper>
      {isInjectedWidget() ? (
        swapItem
      ) : (
        <>
          {swapItem}
          <styledEl.MenuItem>
            <styledEl.Link
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              to={parameterizeTradeRoute(tradeContext, Routes.LIMIT_ORDER)}
            >
              <Trans>Limit</Trans>
            </styledEl.Link>
          </styledEl.MenuItem>
          <FeatureGuard featureFlag="advancedOrdersEnabled">
            <styledEl.MenuItem>
              <styledEl.Link
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                to={parameterizeTradeRoute(tradeContext, Routes.ADVANCED_ORDERS)}
              >
                <Trans>Advanced</Trans>
                <styledEl.Badge>
                  <Trans>Beta</Trans>
                </styledEl.Badge>
              </styledEl.Link>
            </styledEl.MenuItem>
          </FeatureGuard>
        </>
      )}
    </styledEl.Wrapper>
  )
}
