import * as styledEl from './styled'
import { TradeWidgetLinks } from '@cow/modules/application/containers/TradeWidgetLinks'
import { CurrencyInputPanel, CurrencyInputPanelProps } from '@cow/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import React from 'react'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { useWalletDetails, useWalletInfo } from '@cow/modules/wallet'
import { TradeWidgetState } from '@cow/modules/trade/types/TradeWidgetState'
import { formatInputAmount } from '@cow/utils/amountFormat'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { Field } from 'state/swap/actions'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useThrottleFn } from '@cow/common/hooks/useThrottleFn'
import usePriceImpact, { PriceImpactParams } from 'hooks/usePriceImpact'
import { SetRecipientProps } from '@cow/modules/swap/containers/SetRecipient'

interface TradeWidgetActions {
  onCurrencySelection: CurrencyInputPanelProps['onCurrencySelection']
  onUserInput: CurrencyInputPanelProps['onUserInput']
  onChangeRecipient: SetRecipientProps['onChangeRecipient']
  onSwitchTokens(): void
}

interface TradeWidgetParams {
  showRecipient: boolean
  isTradePriceUpdating: boolean
  priceImpactParams: PriceImpactParams
  isRateLoading?: boolean
  inputCurrencyInfoOverrides?: Partial<CurrencyInfo>
  outputCurrencyInfoOverrides?: Partial<CurrencyInfo>
}

interface TradeWidgetSlots {
  settingsWidget: JSX.Element
  middleContent?: JSX.Element
  bottomContent?: JSX.Element
}

export interface TradeWidgetProps {
  slots: TradeWidgetSlots
  state: TradeWidgetState
  actions: TradeWidgetActions
  params: TradeWidgetParams
}

export function TradeWidget(props: TradeWidgetProps) {
  const { slots, state, actions, params } = props
  const { settingsWidget, middleContent, bottomContent } = slots

  const {
    orderKind,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
    recipient,
  } = state

  const { onCurrencySelection, onUserInput, onSwitchTokens, onChangeRecipient } = actions
  const {
    showRecipient,
    isTradePriceUpdating,
    isRateLoading,
    priceImpactParams,
    inputCurrencyInfoOverrides,
    outputCurrencyInfoOverrides,
  } = params

  const { chainId } = useWalletInfo()
  const { isWrapOrUnwrap } = useDetectNativeToken()
  const { allowsOffchainSigning } = useWalletDetails()
  const priceImpact = usePriceImpact(priceImpactParams)

  const currenciesLoadingInProgress = !inputCurrency && !outputCurrency

  const inputViewAmount = formatInputAmount(inputCurrencyAmount, inputCurrencyBalance, orderKind === OrderKind.SELL)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    rawAmount: inputCurrencyAmount,
    viewAmount: inputViewAmount,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
    ...inputCurrencyInfoOverrides,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    rawAmount: isWrapOrUnwrap ? inputCurrencyAmount : outputCurrencyAmount,
    viewAmount: isWrapOrUnwrap
      ? inputViewAmount
      : formatInputAmount(outputCurrencyAmount, outputCurrencyBalance, orderKind === OrderKind.BUY),
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo: null,
    ...outputCurrencyInfoOverrides,
  }

  const maxBalance = maxAmountSpend(inputCurrencyInfo.balance || undefined)
  const showSetMax = maxBalance?.greaterThan(0) && !inputCurrencyInfo.rawAmount?.equalTo(maxBalance)

  // Disable too frequent tokens switching
  const throttledOnSwitchTokens = useThrottleFn(onSwitchTokens, 500)

  return (
    <styledEl.Container>
      <styledEl.ContainerBox>
        <styledEl.Header>
          <TradeWidgetLinks />
          {settingsWidget}
        </styledEl.Header>

        <CurrencyInputPanel
          id="input-currency-input"
          disableNonToken={false}
          chainId={chainId}
          loading={currenciesLoadingInProgress}
          onCurrencySelection={onCurrencySelection}
          onUserInput={onUserInput}
          allowsOffchainSigning={allowsOffchainSigning}
          currencyInfo={inputCurrencyInfo}
          showSetMax={showSetMax}
          topLabel={inputCurrencyInfo.label}
        />
        {!isWrapOrUnwrap && middleContent}
        <styledEl.CurrencySeparatorBox withRecipient={!isWrapOrUnwrap && showRecipient}>
          <CurrencyArrowSeparator
            isCollapsed={false}
            onSwitchTokens={throttledOnSwitchTokens}
            withRecipient={showRecipient}
            isLoading={isTradePriceUpdating}
            hasSeparatorLine={true}
            border={true}
          />
        </styledEl.CurrencySeparatorBox>
        <CurrencyInputPanel
          id="output-currency-input"
          disableNonToken={false}
          chainId={chainId}
          loading={currenciesLoadingInProgress}
          isRateLoading={isRateLoading}
          onCurrencySelection={onCurrencySelection}
          onUserInput={onUserInput}
          allowsOffchainSigning={allowsOffchainSigning}
          currencyInfo={outputCurrencyInfo}
          priceImpactParams={priceImpact}
          topLabel={outputCurrencyInfo.label}
        />
        {showRecipient && (
          <styledEl.StyledRemoveRecipient recipient={recipient || ''} onChangeRecipient={onChangeRecipient} />
        )}

        {bottomContent}
      </styledEl.ContainerBox>
    </styledEl.Container>
  )
}
