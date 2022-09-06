import React from 'react'
import { SwapFormProps } from 'pages/NewSwap/typings'
import * as styledEl from 'pages/NewSwap/styled'
import { CurrencyInputPanel } from 'pages/NewSwap/pureComponents/CurrencyInputPanel'
import { CurrencyArrowSeparator } from 'pages/NewSwap/pureComponents/CurrencyArrowSeparator'
import { TradeRates } from 'pages/NewSwap/pureComponents/TradeRates'
import { swapPagePropsChecker } from 'pages/NewSwap/propsChecker'

export const SwapForm = React.memo(function (props: SwapFormProps) {
  const {
    swapActions,
    allowedSlippage,
    isGettingNewQuote,
    inputCurrencyInfo,
    outputCurrencyInfo,
    priceImpactParams,
    allowsOffchainSigning,
    subsidyAndBalance,
  } = props
  const { onSwitchTokens } = swapActions

  console.log('SWAP PAGE RENDER: ', props)

  return (
    <>
      <styledEl.SwapHeaderStyled allowedSlippage={allowedSlippage} />

      <CurrencyInputPanel
        swapActions={swapActions}
        subsidyAndBalance={subsidyAndBalance}
        allowsOffchainSigning={allowsOffchainSigning}
        currencyInfo={inputCurrencyInfo}
        showSetMax={true}
      />
      <CurrencyArrowSeparator onSwitchTokens={onSwitchTokens} isLoading={isGettingNewQuote} />
      <CurrencyInputPanel
        swapActions={swapActions}
        subsidyAndBalance={subsidyAndBalance}
        allowsOffchainSigning={allowsOffchainSigning}
        currencyInfo={outputCurrencyInfo}
        priceImpactParams={priceImpactParams}
      />
      <TradeRates />
    </>
  )
}, swapPagePropsChecker)
