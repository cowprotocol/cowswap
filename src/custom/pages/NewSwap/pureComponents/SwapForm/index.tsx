import React from 'react'
import { SwapFormProps } from 'pages/NewSwap/typings'
import * as styledEl from 'pages/NewSwap/styled'
import { CurrencyInputPanel } from 'pages/NewSwap/pureComponents/CurrencyInputPanel'
import { CurrencyArrowSeparator } from 'pages/NewSwap/pureComponents/CurrencyArrowSeparator'
import { swapPagePropsChecker } from 'pages/NewSwap/propsChecker'
import { AddRecipient } from 'pages/NewSwap/pureComponents/AddRecipient'
import { maxAmountSpend } from '@src/utils/maxAmountSpend'

export const SwapForm = React.memo(function (props: SwapFormProps) {
  const {
    swapActions,
    allowedSlippage,
    isTradePriceUpdating,
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
  const maxBalance = inputCurrencyInfo.balance ? maxAmountSpend(inputCurrencyInfo.balance) : undefined
  const showSetMax = maxBalance?.greaterThan(0) && !inputCurrencyInfo.rawAmount?.equalTo(maxBalance)

  console.debug('SWAP PAGE RENDER: ', props)

  return (
    <>
      <styledEl.SwapHeaderStyled allowedSlippage={allowedSlippage} />

      <CurrencyInputPanel
        id="swap-currency-input"
        loading={currenciesLoadingInProgress}
        swapActions={swapActions}
        subsidyAndBalance={subsidyAndBalance}
        allowsOffchainSigning={allowsOffchainSigning}
        currencyInfo={inputCurrencyInfo}
        showSetMax={showSetMax}
      />
      <styledEl.CurrencySeparatorBox withRecipient={showRecipientControls}>
        <CurrencyArrowSeparator
          onSwitchTokens={onSwitchTokens}
          withRecipient={showRecipientControls}
          isLoading={isTradePriceUpdating}
        />
        {showRecipientControls && recipient === null && <AddRecipient onChangeRecipient={onChangeRecipient} />}
      </styledEl.CurrencySeparatorBox>
      <CurrencyInputPanel
        id="swap-currency-output"
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
