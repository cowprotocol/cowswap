import { useHistory, useLocation } from 'react-router-dom'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { LimitOrdersState, updateLimitOrdersAtom } from '@cow/modules/limitOrders'
import { Writeable } from '@cow/types'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { Price } from '@uniswap/sdk-core'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { TRADE_URL_BUY_AMOUNT_KEY, TRADE_URL_SELL_AMOUNT_KEY } from '@cow/modules/trade/const/tradeUrl'
import { getIntOrFloat } from '@cow/utils/getIntOrFloat'

/**
 * Parse sell/buy amount from URL and apply to Limit orders widget
 * Example:
 * /#/1/limit-orders/WETH/COW?sellAmount=4&buyAmount=360000
 *
 * In case when both sellAmount and buyAmount specified, the price will be automatically calculated
 */
export function useSetupLimitOrderAmountsFromUrl() {
  const history = useHistory()
  const { search, pathname } = useLocation()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const updateLimitRate = useUpdateAtom(updateLimitRateAtom)
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()

  const cleanParams = useCallback(() => {
    const queryParams = new URLSearchParams(search)

    queryParams.delete(TRADE_URL_BUY_AMOUNT_KEY)
    queryParams.delete(TRADE_URL_SELL_AMOUNT_KEY)

    history.push(pathname + '?' + queryParams)
  }, [history, pathname, search])

  useLayoutEffect(() => {
    const sellAmount = getIntOrFloat(params.get(TRADE_URL_SELL_AMOUNT_KEY))
    const buyAmount = getIntOrFloat(params.get(TRADE_URL_BUY_AMOUNT_KEY))
    const update: Partial<Writeable<LimitOrdersState>> = {}

    const sellCurrencyAmount = inputCurrency && sellAmount ? tryParseCurrencyAmount(sellAmount, inputCurrency) : null
    const buyCurrencyAmount = outputCurrency && buyAmount ? tryParseCurrencyAmount(buyAmount, outputCurrency) : null

    if (sellCurrencyAmount) {
      update.inputCurrencyAmount = FractionUtils.serializeFractionToJSON(sellCurrencyAmount)
    }
    if (buyCurrencyAmount) {
      update.outputCurrencyAmount = FractionUtils.serializeFractionToJSON(buyCurrencyAmount)
    }

    if (sellCurrencyAmount && buyCurrencyAmount) {
      const activeRate = new Price({ baseAmount: sellCurrencyAmount, quoteAmount: buyCurrencyAmount })
      updateLimitRate({ activeRate, isTypedValue: false, isRateFromUrl: true })
    }

    updateLimitOrdersState(update)

    // Clean params only when an update was applied or currecies are loaded
    if (Object.keys(update).length > 1 || inputCurrency || outputCurrency) {
      cleanParams()
    }
  }, [params, updateLimitOrdersState, inputCurrency, outputCurrency, updateLimitRate, cleanParams])
}
