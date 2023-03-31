import React from 'react'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { SwapFormProps } from '@cow/modules/swap/containers/NewSwapWidget/types'
import * as styledEl from '@cow/modules/swap/containers/NewSwapWidget/styled'
import { CurrencyInputPanel } from '@cow/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import { swapPagePropsChecker } from '@cow/modules/swap/containers/NewSwapWidget/propsChecker'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'

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
  const isEthFlow = useIsEthFlow()

  console.debug('SWAP PAGE RENDER: ', props)

  return (
    <styledEl.SwapFormWrapper>
      <styledEl.SwapHeaderStyled allowedSlippage={allowedSlippage} />

      <CurrencyInputPanel
        id="swap-currency-input"
        chainId={chainId}
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
      </styledEl.CurrencySeparatorBox>
      <CurrencyInputPanel
        id="swap-currency-output"
        chainId={chainId}
        inputDisabled={isEthFlow}
        inputTooltip={
          isEthFlow ? t`You cannot edit this field when selling ${inputCurrencyInfo?.currency?.symbol}` : undefined
        }
        loading={currenciesLoadingInProgress}
        onCurrencySelection={onCurrencySelection}
        onUserInput={onUserInput}
        subsidyAndBalance={subsidyAndBalance}
        allowsOffchainSigning={allowsOffchainSigning}
        currencyInfo={outputCurrencyInfo}
        priceImpactParams={priceImpactParams}
      />
      {showRecipientControls && (
        <styledEl.SetRecipientStyled recipient={recipient || ''} onChangeRecipient={onChangeRecipient} />
      )}
    </styledEl.SwapFormWrapper>
  )
}, swapPagePropsChecker)
