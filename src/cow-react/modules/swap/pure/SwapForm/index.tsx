import React from 'react'
import { SwapFormProps } from '@cow/modules/swap/containers/NewSwapWidget/types'
import * as styledEl from '@cow/modules/swap/containers/NewSwapWidget/styled'
import { CurrencyInputPanel } from '@cow/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import { swapPagePropsChecker } from '@cow/modules/swap/containers/NewSwapWidget/propsChecker'
import { AddRecipient } from '@cow/common/pure/AddRecipient'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'

export const SwapForm = React.memo(function (props: SwapFormProps) {
  const {
    chainId,
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
  const { onCurrencySelection, onSwitchTokens, onChangeRecipient, onUserInput } = swapActions
  const currenciesLoadingInProgress = !inputCurrencyInfo.currency && !outputCurrencyInfo.currency
  const maxBalance = inputCurrencyInfo.balance ? maxAmountSpend(inputCurrencyInfo.balance) : undefined
  const showSetMax = maxBalance?.greaterThan(0) && !inputCurrencyInfo.rawAmount?.equalTo(maxBalance)
  const isSupportedNetwork = isSupportedChainId(chainId)

  console.debug('SWAP PAGE RENDER: ', props)

  return (
    <styledEl.SwapFormWrapper>
      <styledEl.SwapHeaderStyled allowedSlippage={allowedSlippage} />

      <CurrencyInputPanel
        id="swap-currency-input"
        disabled={!isSupportedNetwork}
        loading={currenciesLoadingInProgress}
        onCurrencySelection={onCurrencySelection}
        onUserInput={onUserInput}
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
        disabled={!isSupportedNetwork}
        loading={currenciesLoadingInProgress}
        onCurrencySelection={onCurrencySelection}
        onUserInput={onUserInput}
        subsidyAndBalance={subsidyAndBalance}
        allowsOffchainSigning={allowsOffchainSigning}
        currencyInfo={outputCurrencyInfo}
        priceImpactParams={priceImpactParams}
      />
      {showRecipientControls && recipient !== null && (
        <styledEl.RemoveRecipientStyled recipient={recipient} onChangeRecipient={onChangeRecipient} />
      )}
    </styledEl.SwapFormWrapper>
  )
}, swapPagePropsChecker)
