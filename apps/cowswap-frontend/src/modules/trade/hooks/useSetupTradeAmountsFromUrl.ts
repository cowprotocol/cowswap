import { useCallback, useMemo } from 'react'

import { FractionUtils, getIntOrFloat, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router-dom'
import { Writeable } from 'types'

import {
  TRADE_URL_BUY_AMOUNT_KEY,
  TRADE_URL_ORDER_KIND_KEY,
  TRADE_URL_SELL_AMOUNT_KEY,
} from 'modules/trade/const/tradeUrl'

import { useNavigate } from 'common/hooks/useNavigate'
import { useSafeEffect } from 'common/hooks/useSafeMemo'
import { TradeAmounts } from 'common/types'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useTradeState } from './useTradeState'

import { ExtendedTradeRawState } from '../types/TradeRawState'

interface SetupTradeAmountsParams {
  onlySell?: boolean
  onAmountsUpdate?: (amounts: TradeAmounts) => void
}
/**
 * Parse sell/buy amount from URL and apply to Limit orders widget
 * Example:
 * /#/1/limit/WETH/COW?sellAmount=4&buyAmount=360000
 *
 * In case when both sellAmount and buyAmount specified, the price will be automatically calculated
 */
export function useSetupTradeAmountsFromUrl({ onAmountsUpdate, onlySell }: SetupTradeAmountsParams) {
  const navigate = useNavigate()
  const { search, pathname } = useLocation()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const { updateState } = useTradeState()
  const state = useDerivedTradeState()
  const { inputCurrency, outputCurrency } = state || {}

  const cleanParams = useCallback(() => {
    const queryParams = new URLSearchParams(search)

    queryParams.delete(TRADE_URL_BUY_AMOUNT_KEY)
    queryParams.delete(TRADE_URL_SELL_AMOUNT_KEY)
    queryParams.delete(TRADE_URL_ORDER_KIND_KEY)

    navigate({ pathname, search: queryParams.toString() }, { replace: true })
  }, [navigate, pathname, search])

  useSafeEffect(() => {
    const orderKind = params.get(TRADE_URL_ORDER_KIND_KEY) as OrderKind | null
    const sellAmount = getIntOrFloat(params.get(TRADE_URL_SELL_AMOUNT_KEY))
    const buyAmount = getIntOrFloat(params.get(TRADE_URL_BUY_AMOUNT_KEY))
    const update: Partial<Writeable<ExtendedTradeRawState>> = {}

    const isSellAmountValid = inputCurrency && sellAmount && +sellAmount >= 0
    const isBuyAmountValid = outputCurrency && buyAmount && +buyAmount >= 0

    const sellCurrencyAmount = isSellAmountValid ? tryParseCurrencyAmount(sellAmount, inputCurrency) : null
    const buyCurrencyAmount = isBuyAmountValid ? tryParseCurrencyAmount(buyAmount, outputCurrency) : null

    if (buyCurrencyAmount) {
      update.outputCurrencyAmount = FractionUtils.serializeFractionToJSON(buyCurrencyAmount)
    }

    if (sellCurrencyAmount) {
      update.inputCurrencyAmount = FractionUtils.serializeFractionToJSON(sellCurrencyAmount)
    }

    if (onlySell) {
      update.outputCurrencyAmount = null

      update.orderKind = OrderKind.SELL
    } else {
      update.orderKind = orderKind || (!buyCurrencyAmount ? OrderKind.SELL : OrderKind.BUY)
    }

    const hasUpdates = Object.keys(update).length > 0

    if (hasUpdates) {
      // Clean params only when an update was applied or currencies are loaded
      if (inputCurrency || outputCurrency) {
        setTimeout(cleanParams)
      }

      updateState?.(update)

      if (sellCurrencyAmount && buyCurrencyAmount) {
        onAmountsUpdate?.({ inputAmount: sellCurrencyAmount, outputAmount: buyCurrencyAmount })
      }
    }
    // Trigger only when URL or assets are changed
  }, [params, inputCurrency, outputCurrency, onlySell])
}
