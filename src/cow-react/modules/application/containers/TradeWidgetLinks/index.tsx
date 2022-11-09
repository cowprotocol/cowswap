import { Trans } from '@lingui/macro'
import { Routes } from '@cow/constants/routes'

import { ThemedText } from 'theme'
import { RowFixed } from 'components/Row'
import { LIMIT_ORDERS_ENABLED } from '@cow/constants/featureFlags'
import { FeatureFlag } from '@cow/utils/featureFlags'
import { useMemo } from 'react'
import { useTradeState } from '@cow/modules/trade/hooks/useTradeState'
import { parameterizeTradeRoute } from '@cow/modules/trade/utils/parameterizeTradeRoute'
import * as styledEl from './styled'

export function TradeWidgetLinks() {
  const tradeState = useTradeState()

  const tradeContext = useMemo(
    () => ({
      inputCurrencyId: tradeState?.state.inputCurrencyId || undefined,
      outputCurrencyId: tradeState?.state.outputCurrencyId || undefined,
      chainId: tradeState?.state.chainId?.toString(),
    }),
    [tradeState?.state]
  )

  return FeatureFlag.get(LIMIT_ORDERS_ENABLED) ? (
    <RowFixed>
      <styledEl.Link activeClassName="active" to={parameterizeTradeRoute(tradeContext, Routes.SWAP)}>
        <ThemedText.Black fontWeight={500} fontSize={16} style={{ marginRight: '8px' }}>
          <Trans>Swap</Trans>
        </ThemedText.Black>
      </styledEl.Link>
      <styledEl.Link activeClassName="active" to={parameterizeTradeRoute(tradeContext, Routes.LIMIT_ORDER)}>
        <ThemedText.Black fontWeight={500} fontSize={16} style={{ marginRight: '8px' }}>
          <Trans>Limit</Trans>
        </ThemedText.Black>
      </styledEl.Link>
    </RowFixed>
  ) : (
    <RowFixed>
      <ThemedText.Black fontWeight={500} fontSize={16} style={{ marginRight: '8px' }}>
        <Trans>Swap</Trans>
      </ThemedText.Black>
    </RowFixed>
  )
}
