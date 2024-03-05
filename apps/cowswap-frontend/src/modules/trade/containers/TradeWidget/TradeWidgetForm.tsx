import React, { useEffect } from 'react'

import ICON_ORDERS from '@cowprotocol/assets/svg/orders.svg'
import { isInjectedWidget, maxAmountSpend } from '@cowprotocol/common-utils'
import { ButtonOutlined, MY_ORDERS_ID } from '@cowprotocol/ui'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/macro'
import SVG from 'react-inlinesvg'
import { useLocation } from 'react-router-dom'

import { AccountElement } from 'legacy/components/Header/AccountElement'
import { upToLarge, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { useToggleAccountModal } from 'modules/account'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useOpenTokenSelectWidget } from 'modules/tokensList'
import { useIsAlternativeOrderModalVisible } from 'modules/trade/state/alternativeOrder'

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

const scrollToMyOrders = () => {
  const element = document.getElementById(MY_ORDERS_ID)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

export function TradeWidgetForm(props: TradeWidgetProps) {
  const isInjectedWidgetMode = isInjectedWidget()
  const injectedWidgetParams = useInjectedWidgetParams()

  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
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

  const alternativeOrderModalVisible = useIsAlternativeOrderModalVisible()

  // Disable too frequent tokens switching
  const throttledOnSwitchTokens = useThrottleFn(onSwitchTokens, 500)

  const isUpToLarge = useMediaQuery(upToLarge)

  const currencyInputCommonProps = {
    isChainIdUnsupported,
    chainId,
    areCurrenciesLoading,
    bothCurrenciesSet,
    onCurrencySelection,
    onUserInput,
    allowsOffchainSigning,
    openTokenSelectWidget,
    tokenSelectorDisabled: alternativeOrderModalVisible,
  }

  /**
   * Reset recipient value only once at App start if it's not set in URL
   */
  useEffect(() => {
    if (!hasRecipientInUrl && !isAlternativeOrderModalVisible) {
      onChangeRecipient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const location = useLocation()
  const isSwapMode = location.pathname.includes('/swap/')
  const toggleAccountModal = useToggleAccountModal()

  const handleClick = () => {
    if (isSwapMode) {
      toggleAccountModal()
    } else {
      scrollToMyOrders()
    }
  }

  return (
    <>
      <styledEl.ContainerBox>
        <styledEl.Header>
          {isAlternativeOrderModalVisible ? <div></div> : <TradeWidgetLinks isDropdown={isInjectedWidgetMode} />}
          {isInjectedWidgetMode && !injectedWidgetParams.hideConnectButton && (
            <AccountElement isWidgetMode={isInjectedWidgetMode} pendingActivities={pendingActivity} />
          )}

          {isUpToLarge && (
            <ButtonOutlined margin={'0 16px 0 auto'} onClick={handleClick}>
              My orders <SVG src={ICON_ORDERS} />
            </ButtonOutlined>
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
                onSwitchTokens={isChainIdUnsupported ? () => void 0 : throttledOnSwitchTokens}
                withRecipient={withRecipient}
                isLoading={isTradePriceUpdating}
                disabled={isAlternativeOrderModalVisible}
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
