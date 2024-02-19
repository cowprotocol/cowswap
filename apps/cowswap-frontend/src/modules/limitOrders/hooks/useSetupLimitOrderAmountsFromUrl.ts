import { useCallback, useLayoutEffect, useMemo } from 'react'

import { FractionUtils, getIntOrFloat, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Price } from '@uniswap/sdk-core'

import { useLocation, useNavigate } from 'react-router-dom'
import { Writeable } from 'types'

import { LimitOrdersRawState } from 'modules/limitOrders'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { useUpdateActiveRate } from 'modules/limitOrders/hooks/useUpdateActiveRate'
import { TRADE_URL_BUY_AMOUNT_KEY, TRADE_URL_SELL_AMOUNT_KEY } from 'modules/trade/const/tradeUrl'

/**
 * Parse sell/buy amount from URL and apply to Limit orders widget
 * Example:
 * /#/1/limit/WETH/COW?sellAmount=4&buyAmount=360000
 *
 * In case when both sellAmount and buyAmount specified, the price will be automatically calculated
 */
export function useSetupLimitOrderAmountsFromUrl() {
  const navigate = useNavigate()
  const { search, pathname } = useLocation()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const updateLimitOrdersState = useUpdateLimitOrdersRawState()
  const updateRate = useUpdateActiveRate()
  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()

  const cleanParams = useCallback(() => {
    const queryParams = new URLSearchParams(search)

    queryParams.delete(TRADE_URL_BUY_AMOUNT_KEY)
    queryParams.delete(TRADE_URL_SELL_AMOUNT_KEY)

    navigate({ pathname, search: queryParams.toString() }, { replace: true })
  }, [navigate, pathname, search])

  useLayoutEffect(() => {
    const sellAmount = getIntOrFloat(params.get(TRADE_URL_SELL_AMOUNT_KEY))
    const buyAmount = getIntOrFloat(params.get(TRADE_URL_BUY_AMOUNT_KEY))
    const update: Partial<Writeable<LimitOrdersRawState>> = {}

    const isSellAmountValid = inputCurrency && sellAmount && +sellAmount >= 0
    const isBuyAmountValid = outputCurrency && buyAmount && +buyAmount >= 0

    const sellCurrencyAmount = isSellAmountValid ? tryParseCurrencyAmount(sellAmount, inputCurrency) : null
    const buyCurrencyAmount = isBuyAmountValid ? tryParseCurrencyAmount(buyAmount, outputCurrency) : null

    if (sellCurrencyAmount) {
      update.inputCurrencyAmount = FractionUtils.serializeFractionToJSON(sellCurrencyAmount)
      update.orderKind = OrderKind.SELL
    }
    if (buyCurrencyAmount) {
      update.outputCurrencyAmount = FractionUtils.serializeFractionToJSON(buyCurrencyAmount)

      if (!sellCurrencyAmount) {
        update.orderKind = OrderKind.BUY
      }
    }

    const hasUpdates = Object.keys(update).length > 1

    if (hasUpdates) {
      // Clean params only when an update was applied or currencies are loaded
      if (inputCurrency || outputCurrency) {
        setTimeout(cleanParams)
      }

      updateLimitOrdersState(update)

      if (sellCurrencyAmount && buyCurrencyAmount) {
        const activeRate = new Price({ baseAmount: sellCurrencyAmount, quoteAmount: buyCurrencyAmount })
        updateRate({ activeRate, isTypedValue: false, isRateFromUrl: true, isAlternativeOrderRate: false })
      }
    }
    // Trigger only when URL or assets are changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, inputCurrency, outputCurrency])
}
