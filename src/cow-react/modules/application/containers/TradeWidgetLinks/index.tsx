import { Trans } from '@lingui/macro'
import { Routes } from '@cow/constants/routes'

import { RowFixed } from 'components/Row'
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

  return (
    <RowFixed>
      <styledEl.Link activeClassName="active" to={parameterizeTradeRoute(tradeContext, Routes.SWAP)}>
        <styledEl.MenuItem>
          <Trans>Swap</Trans>
        </styledEl.MenuItem>
      </styledEl.Link>

      <styledEl.Link activeClassName="active" to={parameterizeTradeRoute(tradeContext, Routes.LIMIT_ORDER)}>
        <styledEl.MenuItem>
          <Trans>Limit</Trans>
        </styledEl.MenuItem>
        <styledEl.Badge>
          <Trans>Beta</Trans>
        </styledEl.Badge>
      </styledEl.Link>
    </RowFixed>
  )
}
