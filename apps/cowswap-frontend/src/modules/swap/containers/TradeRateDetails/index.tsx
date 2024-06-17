import React, { useMemo } from 'react'

import { CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import {
  getTotalCosts,
  ReceiveAmountInfo,
  TradeFeesAndCosts,
  TradeTotalCostsDetails,
  useDerivedTradeState,
  NetworkCostsRow,
} from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'

import { RateInfoParams } from 'common/pure/RateInfo'

import { NetworkCostsSuffix } from '../../pure/NetworkCostsSuffix'
import { RowDeadline } from '../Row/RowDeadline'
import { RowSlippage } from '../Row/RowSlippage'

interface TradeRateDetailsProps {
  receiveAmountInfo: ReceiveAmountInfo | null
  rateInfoParams: RateInfoParams
  allowedSlippage: Percent | null
  isSwapEth: boolean
}

export function TradeRateDetails({
  allowedSlippage,
  receiveAmountInfo,
  rateInfoParams,
  isSwapEth,
}: TradeRateDetailsProps) {
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()

  const inputCurrency = derivedTradeState?.inputCurrency
  const costsExceedFeeRaw = tradeQuote?.error?.data?.fee_amount

  const networkFeeAmount = useMemo(() => {
    if (!costsExceedFeeRaw || !inputCurrency) return null

    return CurrencyAmount.fromRawAmount(inputCurrency, costsExceedFeeRaw)
  }, [costsExceedFeeRaw, inputCurrency])

  const widgetParams = useInjectedWidgetParams()
  const networkFeeAmountUsd = useUsdAmount(networkFeeAmount).value

  if (!receiveAmountInfo) {
    if (!networkFeeAmount) return null

    return (
      <div style={{ padding: '0 10px' }}>
        <NetworkCostsRow
          networkFeeAmount={networkFeeAmount}
          networkFeeAmountUsd={networkFeeAmountUsd}
          withTimelineDot={false}
          amountSuffix={isSwapEth ? <NetworkCostsSuffix /> : null}
          alwaysRow
        />
      </div>
    )
  }

  const totalCosts = getTotalCosts(receiveAmountInfo)

  return (
    <TradeTotalCostsDetails totalCosts={totalCosts} rateInfoParams={rateInfoParams}>
      <TradeFeesAndCosts
        receiveAmountInfo={receiveAmountInfo}
        widgetParams={widgetParams}
        withTimelineDot={false}
        networkCostsSuffix={isSwapEth ? <NetworkCostsSuffix /> : null}
        alwaysRow
      />
      {allowedSlippage && <RowSlippage allowedSlippage={allowedSlippage} />}
      <RowDeadline />
    </TradeTotalCostsDetails>
  )
}
