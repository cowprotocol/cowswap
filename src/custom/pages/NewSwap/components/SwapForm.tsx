import React from 'react'
import { SwapFormProps } from 'pages/NewSwap/typings'
import * as styledEl from 'pages/NewSwap/styled'
import { CurrencyInputPanel } from 'pages/NewSwap/pureComponents/CurrencyInputPanel'
import { CurrencyArrowSeparator } from 'pages/NewSwap/pureComponents/CurrencyArrowSeparator'
import { swapPagePropsChecker } from 'pages/NewSwap/propsChecker'
import { AddRecipient } from 'pages/NewSwap/pureComponents/AddRecipient'

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
    showRecipientControls,
    recipient,
  } = props
  const { onSwitchTokens, onChangeRecipient } = swapActions
  const currenciesLoadingInProgress = !inputCurrencyInfo.currency && !outputCurrencyInfo.currency

  console.log('SWAP PAGE RENDER: ', props)

  return (
    <>
      <styledEl.SwapHeaderStyled allowedSlippage={allowedSlippage} />

      <CurrencyInputPanel
        loading={currenciesLoadingInProgress}
        swapActions={swapActions}
        subsidyAndBalance={subsidyAndBalance}
        allowsOffchainSigning={allowsOffchainSigning}
        currencyInfo={inputCurrencyInfo}
        showSetMax={true}
      />
      <styledEl.CurrencySeparatorBox withRecipient={showRecipientControls}>
        <CurrencyArrowSeparator
          onSwitchTokens={onSwitchTokens}
          withRecipient={showRecipientControls}
          isLoading={isGettingNewQuote}
        />
        {showRecipientControls && recipient === null && <AddRecipient onChangeRecipient={onChangeRecipient} />}
      </styledEl.CurrencySeparatorBox>
      <CurrencyInputPanel
        loading={currenciesLoadingInProgress}
        swapActions={swapActions}
        subsidyAndBalance={subsidyAndBalance}
        allowsOffchainSigning={allowsOffchainSigning}
        currencyInfo={outputCurrencyInfo}
        priceImpactParams={priceImpactParams}
      />
      {showRecipientControls && recipient !== null && (
        <styledEl.RemoveRecipientStyled recipient={recipient} onChangeRecipient={onChangeRecipient} />
      )}
    </>
  )
}, swapPagePropsChecker)
