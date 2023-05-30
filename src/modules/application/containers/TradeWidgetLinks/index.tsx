import { useMemo } from 'react'

import { Trans } from '@lingui/macro'

import { useTradeState } from 'modules/trade/hooks/useTradeState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { ADVANCED_ORDERS_FEATURE_FLAG } from 'constants/featureFlags'
import { Routes } from 'constants/routes'
import { FeatureFlag } from 'utils/featureFlags'

import * as styledEl from './styled'

export function TradeWidgetLinks() {
  const { state } = useTradeState()

  const tradeContext = useMemo(
    () => ({
      inputCurrencyId: state?.inputCurrencyId || undefined,
      outputCurrencyId: state?.outputCurrencyId || undefined,
      chainId: state?.chainId?.toString(),
    }),
    [state]
  )

  return (
    <styledEl.Wrapper>
      <styledEl.MenuItem>
        <styledEl.Link
          className={({ isActive }) => (isActive ? 'active' : undefined)}
          to={parameterizeTradeRoute(tradeContext, Routes.SWAP)}
        >
          <Trans>Swap</Trans>
        </styledEl.Link>
      </styledEl.MenuItem>

      <styledEl.MenuItem>
        <styledEl.Link
          className={({ isActive }) => (isActive ? 'active' : undefined)}
          to={parameterizeTradeRoute(tradeContext, Routes.LIMIT_ORDER)}
        >
          <Trans>Limit</Trans>
          <styledEl.Badge>
            <Trans>Beta</Trans>
          </styledEl.Badge>
        </styledEl.Link>
      </styledEl.MenuItem>

      {FeatureFlag.get(ADVANCED_ORDERS_FEATURE_FLAG) && (
        <styledEl.MenuItem>
          <styledEl.Link
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            to={parameterizeTradeRoute(tradeContext, Routes.ADVANCED_ORDERS)}
          >
            <Trans>Advanced</Trans>
          </styledEl.Link>
        </styledEl.MenuItem>
      )}
    </styledEl.Wrapper>
  )
}
