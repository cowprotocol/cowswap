import { useCallback, useMemo, useRef } from 'react'

import { FractionUtils, getIntOrFloat, isFractionFalsy, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router'
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
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function useSetupTradeAmountsFromUrl({ onAmountsUpdate, onlySell }: SetupTradeAmountsParams) {
  const navigate = useNavigate()
  const { search, pathname } = useLocation()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const { updateState } = useTradeState()
  const state = useDerivedTradeState()
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount } = state || {}

  const isAtLeastOneAmountIsSetRef = useRef(false)
  isAtLeastOneAmountIsSetRef.current = Boolean(inputCurrencyAmount || outputCurrencyAmount)

  const cleanParams = useCallback(() => {
    if (!search) return

    const queryParams = new URLSearchParams(search)

    // Do nothing if queryParams are already clear
    if (
      !queryParams.has(TRADE_URL_BUY_AMOUNT_KEY) &&
      !queryParams.has(TRADE_URL_SELL_AMOUNT_KEY) &&
      !queryParams.has(TRADE_URL_ORDER_KIND_KEY)
    ) {
      return
    }

    queryParams.delete(TRADE_URL_BUY_AMOUNT_KEY)
    queryParams.delete(TRADE_URL_SELL_AMOUNT_KEY)
    queryParams.delete(TRADE_URL_ORDER_KIND_KEY)

    navigate({ pathname, search: queryParams.toString() }, { replace: true })
  }, [navigate, pathname, search])

  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  useSafeEffect(() => {
    const orderKind = params.get(TRADE_URL_ORDER_KIND_KEY) as OrderKind | null
    const sellAmount = getIntOrFloat(params.get(TRADE_URL_SELL_AMOUNT_KEY))
    const buyAmount = getIntOrFloat(params.get(TRADE_URL_BUY_AMOUNT_KEY))
    const update: Partial<Writeable<ExtendedTradeRawState>> = {}

    const isSellAmountValid = inputCurrency && sellAmount && +sellAmount >= 0
    const isBuyAmountValid = outputCurrency && buyAmount && +buyAmount >= 0

    const sellCurrencyAmount = isSellAmountValid ? tryParseCurrencyAmount(sellAmount, inputCurrency) : null
    const buyCurrencyAmount = isBuyAmountValid ? tryParseCurrencyAmount(buyAmount, outputCurrency) : null

    const hasSellAmount = !isFractionFalsy(sellCurrencyAmount)
    const hasBuyAmount = !isFractionFalsy(buyCurrencyAmount)

    if (hasBuyAmount) {
      update.outputCurrencyAmount = FractionUtils.serializeFractionToJSON(buyCurrencyAmount)
    }

    if (hasSellAmount) {
      update.inputCurrencyAmount = FractionUtils.serializeFractionToJSON(sellCurrencyAmount)
    }

    if (onlySell) {
      delete update.outputCurrencyAmount

      update.orderKind = OrderKind.SELL
    } else {
      if (orderKind) {
        update.orderKind = orderKind
      } else if (hasSellAmount || hasBuyAmount) {
        update.orderKind = !hasSellAmount && hasBuyAmount ? OrderKind.BUY : OrderKind.SELL
      }
    }

    // When both sell and buy amount are not set
    // Then set 1 unit to sell by default
    if (!isAtLeastOneAmountIsSetRef.current && !update.inputCurrencyAmount && inputCurrency) {
      update.inputCurrencyAmount = FractionUtils.serializeFractionToJSON(tryParseCurrencyAmount('1', inputCurrency))
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
  }, [params, inputCurrency, outputCurrency, cleanParams, onlySell])
}
