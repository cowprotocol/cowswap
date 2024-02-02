import React, { useEffect } from 'react'

import { isInjectedWidget, maxAmountSpend } from '@cowprotocol/common-utils'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/macro'

import { AccountElement } from 'legacy/components/Header/AccountElement'

import { useOpenTokenSelectWidget } from 'modules/tokensList'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useThrottleFn } from 'common/hooks/useThrottleFn'
import { CurrencyArrowSeparator } from 'common/pure/CurrencyArrowSeparator'
import { CurrencyInputPanel } from 'common/pure/CurrencyInputPanel'
import { PoweredFooter } from 'common/pure/PoweredFooter'

import * as styledEl from './styled'
import { TradeWidgetProps } from './types'

import { useTradeStateFromUrl } from '../../hooks/setupTradeState/useTradeStateFromUrl'
import { useIsWrapOrUnwrap } from '../../hooks/useIsWrapOrUnwrap'
import { TradeWidgetLinks } from '../TradeWidgetLinks'
import { WrapFlowActionButton } from '../WrapFlowActionButton'

export function TradeWidgetForm(props: TradeWidgetProps) {
  const isInjectedWidgetMode = isInjectedWidget()
  const { pendingActivity } = useCategorizeRecentActivity()

  const { slots, inputCurrencyInfo, outputCurrencyInfo, actions, params, disableOutput } = props
  const { settingsWidget, lockScreen, middleContent, bottomContent, outerContent } = slots

  const { onCurrencySelection, onUserInput, onSwitchTokens, onChangeRecipient } = actions
  const {
    compactView,
    showRecipient,
    isTradePriceUpdating,
    isEoaEthFlow = false,
    priceImpact,
    recipient,
    disablePriceImpact,
  } = params

  const { chainId } = useWalletInfo()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const { allowsOffchainSigning } = useWalletDetails()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const isSafeWallet = useIsSafeWallet()
  const openTokenSelectWidget = useOpenTokenSelectWidget()
  const tradeStateFromUrl = useTradeStateFromUrl()

  const areCurrenciesLoading = !inputCurrencyInfo.currency && !outputCurrencyInfo.currency
  const bothCurrenciesSet = !!inputCurrencyInfo.currency && !!outputCurrencyInfo.currency

  const hasRecipientInUrl = !!tradeStateFromUrl.recipient
  const withRecipient = !isWrapOrUnwrap && (showRecipient || hasRecipientInUrl)
  const maxBalance = maxAmountSpend(inputCurrencyInfo.balance || undefined, isSafeWallet)
  const showSetMax = maxBalance?.greaterThan(0) && !inputCurrencyInfo.amount?.equalTo(maxBalance)

  // Disable too frequent tokens switching
  const throttledOnSwitchTokens = useThrottleFn(onSwitchTokens, 500)

  const currencyInputCommonProps = {
    isChainIdUnsupported,
    chainId,
    areCurrenciesLoading,
    bothCurrenciesSet,
    onCurrencySelection,
    onUserInput,
    allowsOffchainSigning,
    openTokenSelectWidget,
  }

  /**
   * Reset recipient value only once at App start if it's not set in URL
   */
  useEffect(() => {
    if (!hasRecipientInUrl) {
      onChangeRecipient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <styledEl.ContainerBox>
        <styledEl.Header>
          <TradeWidgetLinks isDropdown={isInjectedWidgetMode} />
          {isInjectedWidgetMode && (
            <AccountElement isWidgetMode={isInjectedWidgetMode} pendingActivities={pendingActivity} />
          )}
          {!lockScreen && settingsWidget}
        </styledEl.Header>

        {lockScreen ? (
          lockScreen
        ) : (
          <>
            <div>
              <CurrencyInputPanel
                id="input-currency-input"
                currencyInfo={inputCurrencyInfo}
                showSetMax={showSetMax}
                maxBalance={maxBalance}
                topLabel={isWrapOrUnwrap ? undefined : inputCurrencyInfo.label}
                {...currencyInputCommonProps}
              />
            </div>
            {!isWrapOrUnwrap && middleContent}
            <styledEl.CurrencySeparatorBox compactView={compactView} withRecipient={withRecipient}>
              <CurrencyArrowSeparator
                isCollapsed={compactView}
                hasSeparatorLine={!compactView}
                border={!compactView}
                onSwitchTokens={isChainIdUnsupported ? () => void 0 : throttledOnSwitchTokens}
                withRecipient={withRecipient}
                isLoading={isTradePriceUpdating}
              />
            </styledEl.CurrencySeparatorBox>
            <div>
              <CurrencyInputPanel
                id="output-currency-input"
                inputDisabled={isEoaEthFlow || isWrapOrUnwrap || disableOutput}
                inputTooltip={
                  isEoaEthFlow
                    ? t`You cannot edit this field when selling ${inputCurrencyInfo?.currency?.symbol}`
                    : undefined
                }
                currencyInfo={
                  isWrapOrUnwrap ? { ...outputCurrencyInfo, amount: inputCurrencyInfo.amount } : outputCurrencyInfo
                }
                priceImpactParams={!disablePriceImpact ? priceImpact : undefined}
                topLabel={isWrapOrUnwrap ? undefined : outputCurrencyInfo.label}
                {...currencyInputCommonProps}
              />
            </div>
            {withRecipient && (
              <styledEl.StyledRemoveRecipient recipient={recipient || ''} onChangeRecipient={onChangeRecipient} />
            )}

            {isWrapOrUnwrap ? <WrapFlowActionButton /> : bottomContent}
          </>
        )}

        {isInjectedWidgetMode && <PoweredFooter />}
      </styledEl.ContainerBox>
      <styledEl.OuterContentWrapper>{outerContent}</styledEl.OuterContentWrapper>
    </>
  )
}
