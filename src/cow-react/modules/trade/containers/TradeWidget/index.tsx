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
import { t } from '@lingui/macro'

interface TradeWidgetActions {
  onCurrencySelection: CurrencyInputPanelProps['onCurrencySelection']
  onUserInput: CurrencyInputPanelProps['onUserInput']
  onChangeRecipient: SetRecipientProps['onChangeRecipient']
  onSwitchTokens(): void
}

interface TradeWidgetParams {
  recipient: string | null
  disableNonToken?: boolean
  isEthFlow?: boolean
  compactView: boolean
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
  id?: string
  slots: TradeWidgetSlots
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  actions: TradeWidgetActions
  params: TradeWidgetParams
}

export const TradeWidgetContainer = styledEl.Container

// TODO: add ImportTokenModal, TradeApproveWidget
export function TradeWidget(props: TradeWidgetProps) {
  const { id, slots, inputCurrencyInfo, outputCurrencyInfo, actions, params } = props
  const { settingsWidget, lockScreen, middleContent, bottomContent } = slots

  const { onCurrencySelection, onUserInput, onSwitchTokens, onChangeRecipient } = actions
  const {
    compactView,
    showRecipient,
    isTradePriceUpdating,
    isRateLoading,
    isEthFlow = false,
    disableNonToken = false,
    priceImpact,
    recipient,
  } = params

  const { chainId } = useWalletInfo()
  const { isWrapOrUnwrap } = useDetectNativeToken()
  const { allowsOffchainSigning } = useWalletDetails()

  const currenciesLoadingInProgress = !inputCurrencyInfo.currency && !outputCurrencyInfo.currency

  const maxBalance = maxAmountSpend(inputCurrencyInfo.balance || undefined)
  const showSetMax = maxBalance?.greaterThan(0) && !inputCurrencyInfo.rawAmount?.equalTo(maxBalance)

  // Disable too frequent tokens switching
  const throttledOnSwitchTokens = useThrottleFn(onSwitchTokens, 500)

  return (
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
                loading={currenciesLoadingInProgress}
                onCurrencySelection={onCurrencySelection}
                onUserInput={onUserInput}
                allowsOffchainSigning={allowsOffchainSigning}
                currencyInfo={inputCurrencyInfo}
                showSetMax={showSetMax}
                topLabel={inputCurrencyInfo.label}
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
                inputDisabled={isEthFlow}
                inputTooltip={
                  isEthFlow
                    ? t`You cannot edit this field when selling ${inputCurrencyInfo?.currency?.symbol}`
                    : undefined
                }
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
            </div>
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
