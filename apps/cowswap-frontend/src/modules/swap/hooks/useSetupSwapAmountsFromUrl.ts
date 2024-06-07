import { useCallback, useLayoutEffect, useMemo } from 'react'

import { getIntOrFloat } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router-dom'

import { Field } from 'legacy/state/types'

import {
  TRADE_URL_BUY_AMOUNT_KEY,
  TRADE_URL_ORDER_KIND_KEY,
  TRADE_URL_SELL_AMOUNT_KEY,
} from 'modules/trade/const/tradeUrl'

import { useNavigate } from 'common/hooks/useNavigate'

import { useSwapActionHandlers } from './useSwapState'

/**
 * Parse sell/buy amount from URL and apply to Swap widget
 * Examples:
 * /#/1/swap/WETH/COW?sellAmount=750.20
 * /#/1/swap/WETH/COW?buyAmount=750.20
 *
 * In case when both sellAmount and buyAmount specified, buyAmount will be ignored
 */
export function useSetupSwapAmountsFromUrl() {
  const { search, pathname } = useLocation()
  const navigate = useNavigate()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const { onUserInput } = useSwapActionHandlers()

  const cleanParams = useCallback(() => {
    const queryParams = new URLSearchParams(search)

    queryParams.delete(TRADE_URL_SELL_AMOUNT_KEY)
    queryParams.delete(TRADE_URL_BUY_AMOUNT_KEY)
    queryParams.delete(TRADE_URL_ORDER_KIND_KEY)

    navigate({ pathname, search: queryParams.toString() }, { replace: true })
  }, [navigate, pathname, search])

  useLayoutEffect(() => {
    const orderKind = params.get(TRADE_URL_ORDER_KIND_KEY) as OrderKind | null
    const sellAmount = getIntOrFloat(params.get(TRADE_URL_SELL_AMOUNT_KEY))
    const buyAmount = getIntOrFloat(params.get(TRADE_URL_BUY_AMOUNT_KEY))

    if (buyAmount && +buyAmount >= 0 && orderKind === OrderKind.BUY) {
      onUserInput(Field.OUTPUT, buyAmount)
    } else if (sellAmount && +sellAmount >= 0) {
      onUserInput(Field.INPUT, sellAmount)
    }

    // Clean params only at least one of them is set
    if (sellAmount || buyAmount) {
      cleanParams()
    }
  }, [params, onUserInput, cleanParams])
}
