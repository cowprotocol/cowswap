import { useCallback, useLayoutEffect, useMemo } from 'react'

import { getIntOrFloat } from '@cowprotocol/common-utils'

import { useLocation, useNavigate } from 'react-router-dom'

import { Field } from 'legacy/state/types'

import { TRADE_URL_BUY_AMOUNT_KEY, TRADE_URL_SELL_AMOUNT_KEY } from 'modules/trade/const/tradeUrl'

import { useAdvancedOrdersActions } from '../../advancedOrders/hooks/useAdvancedOrdersActions'

// TODO: unify into a single thing for all forms

/**
 * Parse sell/buy amount from URL and apply to Swap widget
 * Examples:
 * /#/1/advanced-orders/WETH/COW?sellAmount=750.20
 *
 * Buy amount not supported as advanced orders do not support BUY orders
 */
export function useSetupTwapAmountsFromUrls() {
  const { search, pathname } = useLocation()
  const navigate = useNavigate()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const { onUserInput } = useAdvancedOrdersActions()

  const cleanParams = useCallback(() => {
    const queryParams = new URLSearchParams(search)

    queryParams.delete(TRADE_URL_SELL_AMOUNT_KEY)
    queryParams.delete(TRADE_URL_BUY_AMOUNT_KEY)

    navigate({ pathname, search: queryParams.toString() }, { replace: true })
  }, [navigate, pathname, search])

  useLayoutEffect(() => {
    const sellAmount = getIntOrFloat(params.get(TRADE_URL_SELL_AMOUNT_KEY))

    if (sellAmount && +sellAmount >= 0) {
      onUserInput(Field.INPUT, sellAmount)
    }

    cleanParams()
  }, [params, onUserInput, cleanParams])
}
