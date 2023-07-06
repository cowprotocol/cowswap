import React, { useEffect } from 'react'

import { t } from '@lingui/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { maxAmountSpend } from 'legacy/utils/maxAmountSpend'

import { TradeWidgetLinks } from 'modules/application/containers/TradeWidgetLinks'
import { SetRecipientProps } from 'modules/swap/containers/SetRecipient'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { TradeFormValidationUpdater } from 'modules/tradeFormValidation'
import { TradeQuoteUpdater } from 'modules/tradeQuote'
import { useWalletDetails, useWalletInfo } from 'modules/wallet'

import { useThrottleFn } from 'common/hooks/useThrottleFn'
import { CurrencyArrowSeparator } from 'common/pure/CurrencyArrowSeparator'
import { CurrencyInputPanel, CurrencyInputPanelProps } from 'common/pure/CurrencyInputPanel'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import * as styledEl from './styled'
import { TradeWidgetModals } from './TradeWidgetModals'

import { PriceImpactUpdater } from '../../updaters/PriceImpactUpdater'
import { WrapFlowActionButton } from '../WrapFlowActionButton'
import { WrapNativeModal } from '../WrapNativeModal'

export interface TradeWidgetActions {
  onCurrencySelection: CurrencyInputPanelProps['onCurrencySelection']
  onUserInput: CurrencyInputPanelProps['onUserInput']
  onChangeRecipient: SetRecipientProps['onChangeRecipient']
  onSwitchTokens(): void
}

interface TradeWidgetParams {
  recipient: string | null
  disableNonToken?: boolean
  isEoaEthFlow?: boolean
  compactView: boolean
  showRecipient: boolean
  isTradePriceUpdating: boolean
  isExpertMode: boolean
  priceImpact: PriceImpact
  isRateLoading?: boolean
  disableQuotePolling?: boolean
  canSellAllNative?: boolean
}

export interface TradeWidgetSlots {
  settingsWidget: JSX.Element
  lockScreen?: JSX.Element
  middleContent?: JSX.Element
  bottomContent?: JSX.Element
}

export interface TradeWidgetProps {
  id?: string
  slots: TradeWidgetSlots
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  actions: TradeWidgetActions
  params: TradeWidgetParams
  disableOutput?: boolean
}

export const TradeWidgetContainer = styledEl.Container

export function TradeWidget(props: TradeWidgetProps) {
  const { id, slots, inputCurrencyInfo, outputCurrencyInfo, actions, params, disableOutput } = props
  const { settingsWidget, lockScreen, middleContent, bottomContent } = slots

  const { onCurrencySelection, onUserInput, onSwitchTokens, onChangeRecipient } = actions
  const {
    compactView,
    showRecipient,
    isTradePriceUpdating,
    isRateLoading,
    isEoaEthFlow = false,
    disableNonToken = false,
    priceImpact,
    recipient,
    disableQuotePolling = false,
    canSellAllNative = false,
    isExpertMode,
  } = params

  const { chainId } = useWalletInfo()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const { allowsOffchainSigning } = useWalletDetails()

  const currenciesLoadingInProgress = !inputCurrencyInfo.currency && !outputCurrencyInfo.currency

  const maxBalance = maxAmountSpend(inputCurrencyInfo.balance || undefined, canSellAllNative)
  const showSetMax = maxBalance?.greaterThan(0) && !inputCurrencyInfo.amount?.equalTo(maxBalance)

  // Disable too frequent tokens switching
  const throttledOnSwitchTokens = useThrottleFn(onSwitchTokens, 500)

  /**
   * Reset recipient value only once at App start
   */
  useEffect(() => {
    onChangeRecipient(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <styledEl.Container id={id}>
      {!disableQuotePolling && <TradeQuoteUpdater />}
      <TradeWidgetModals />
      <WrapNativeModal />
      <PriceImpactUpdater />
      <TradeFormValidationUpdater isExpertMode={isExpertMode} />

      <styledEl.Container id={id}>
        <styledEl.ContainerBox>
          <styledEl.Header>
            <TradeWidgetLinks />
            {!lockScreen && settingsWidget}
          </styledEl.Header>

          {lockScreen ? (
            lockScreen
          ) : (
            <>
              <div>
                <CurrencyInputPanel
                  id="input-currency-input"
                  disableNonToken={disableNonToken}
                  chainId={chainId}
                  areCurrenciesLoading={currenciesLoadingInProgress}
                  onCurrencySelection={onCurrencySelection}
                  onUserInput={onUserInput}
                  allowsOffchainSigning={allowsOffchainSigning}
                  currencyInfo={inputCurrencyInfo}
                  showSetMax={showSetMax}
                  maxBalance={maxBalance}
                  topLabel={isWrapOrUnwrap ? undefined : inputCurrencyInfo.label}
                />
              </div>
              {!isWrapOrUnwrap && middleContent}
              <styledEl.CurrencySeparatorBox compactView={compactView} withRecipient={!isWrapOrUnwrap && showRecipient}>
                <CurrencyArrowSeparator
                  isCollapsed={compactView}
                  hasSeparatorLine={!compactView}
                  border={!compactView}
                  onSwitchTokens={throttledOnSwitchTokens}
                  withRecipient={showRecipient}
                  isLoading={isTradePriceUpdating}
                />
              </styledEl.CurrencySeparatorBox>
              <div>
                <CurrencyInputPanel
                  id="output-currency-input"
                  disableNonToken={disableNonToken}
                  inputDisabled={isEoaEthFlow || isWrapOrUnwrap || disableOutput}
                  inputTooltip={
                    isEoaEthFlow
                      ? t`You cannot edit this field when selling ${inputCurrencyInfo?.currency?.symbol}`
                      : undefined
                  }
                  chainId={chainId}
                  areCurrenciesLoading={currenciesLoadingInProgress}
                  isRateLoading={isRateLoading}
                  onCurrencySelection={onCurrencySelection}
                  onUserInput={onUserInput}
                  allowsOffchainSigning={allowsOffchainSigning}
                  currencyInfo={
                    isWrapOrUnwrap ? { ...outputCurrencyInfo, amount: inputCurrencyInfo.amount } : outputCurrencyInfo
                  }
                  priceImpactParams={priceImpact}
                  topLabel={isWrapOrUnwrap ? undefined : outputCurrencyInfo.label}
                />
              </div>
              {showRecipient && (
                <styledEl.StyledRemoveRecipient recipient={recipient || ''} onChangeRecipient={onChangeRecipient} />
              )}

              {isWrapOrUnwrap ? <WrapFlowActionButton /> : bottomContent}
            </>
          )}
        </styledEl.ContainerBox>
      </styledEl.Container>
    </styledEl.Container>
  )
}
