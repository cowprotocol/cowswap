import * as styledEl from './styled'
import { TradeWidgetLinks } from '@cow/modules/application/containers/TradeWidgetLinks'
import { CurrencyInputPanel, CurrencyInputPanelProps } from '@cow/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import React from 'react'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { useWalletDetails, useWalletInfo } from '@cow/modules/wallet'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useThrottleFn } from '@cow/common/hooks/useThrottleFn'
import { PriceImpact } from 'hooks/usePriceImpact'
import { SetRecipientProps } from '@cow/modules/swap/containers/SetRecipient'

interface TradeWidgetActions {
  onCurrencySelection: CurrencyInputPanelProps['onCurrencySelection']
  onUserInput: CurrencyInputPanelProps['onUserInput']
  onChangeRecipient: SetRecipientProps['onChangeRecipient']
  onSwitchTokens(): void
}

interface TradeWidgetParams {
  recipient: string | null
  showRecipient: boolean
  isTradePriceUpdating: boolean
  priceImpact: PriceImpact
  isRateLoading?: boolean
}

interface TradeWidgetSlots {
  settingsWidget: JSX.Element
  lockScreen?: JSX.Element
  middleContent?: JSX.Element
  bottomContent?: JSX.Element
}

export interface TradeWidgetProps {
  slots: TradeWidgetSlots
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  actions: TradeWidgetActions
  params: TradeWidgetParams
}

// TODO: add ImportTokenModal, TradeApproveWidget
export function TradeWidget(props: TradeWidgetProps) {
  const { slots, inputCurrencyInfo, outputCurrencyInfo, actions, params } = props
  const { settingsWidget, lockScreen, middleContent, bottomContent } = slots

  const { onCurrencySelection, onUserInput, onSwitchTokens, onChangeRecipient } = actions
  const { showRecipient, isTradePriceUpdating, isRateLoading, priceImpact, recipient } = params

  const { chainId } = useWalletInfo()
  const { isWrapOrUnwrap } = useDetectNativeToken()
  const { allowsOffchainSigning } = useWalletDetails()

  const currenciesLoadingInProgress = !inputCurrencyInfo.currency && !outputCurrencyInfo.currency

  const maxBalance = maxAmountSpend(inputCurrencyInfo.balance || undefined)
  const showSetMax = maxBalance?.greaterThan(0) && !inputCurrencyInfo.rawAmount?.equalTo(maxBalance)

  // Disable too frequent tokens switching
  const throttledOnSwitchTokens = useThrottleFn(onSwitchTokens, 500)

  return (
    <styledEl.Container>
      <styledEl.ContainerBox>
        <styledEl.Header>
          <TradeWidgetLinks />
          {!lockScreen && settingsWidget}
        </styledEl.Header>

        {lockScreen ? (
          lockScreen
        ) : (
          <>
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
          </>
        )}
      </styledEl.ContainerBox>
    </styledEl.Container>
  )
}
