import { Trans } from '@lingui/macro'

import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { FeatureGuard } from 'common/containers/FeatureGuard'
import { Routes } from 'constants/routes'

import * as styledEl from './styled'

export interface TradeWidgetLinksProps {
  showSwap?: boolean
  showLimit?: boolean
  showAdvanced?: boolean
}

export function TradeWidgetLinks(props?: TradeWidgetLinksProps) {
  const { showSwap = true, showLimit = true, showAdvanced = true } = props ?? {}
  const tradeContext = useTradeRouteContext()

  return (
    <styledEl.Wrapper>
      {showSwap && (
        <styledEl.MenuItem>
          <styledEl.Link
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            to={parameterizeTradeRoute(tradeContext, Routes.SWAP)}
          >
            <Trans>Swap</Trans>
          </styledEl.Link>
        </styledEl.MenuItem>
      )}

      {showLimit && (
        <styledEl.MenuItem>
          <styledEl.Link
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            to={parameterizeTradeRoute(tradeContext, Routes.LIMIT_ORDER)}
          >
            <Trans>Limit</Trans>
          </styledEl.Link>
        </styledEl.MenuItem>
      )}
      {showAdvanced && (
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
      )}
    </styledEl.Wrapper>
  )
}
