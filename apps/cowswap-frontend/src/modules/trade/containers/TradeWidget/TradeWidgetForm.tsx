import React, { useCallback, useMemo } from 'react'

import ICON_ORDERS from '@cowprotocol/assets/svg/orders.svg'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget, maxAmountSpend } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonOutlined, Media, MY_ORDERS_ID, SWAP_HEADER_OFFSET } from '@cowprotocol/ui'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { t } from '@lingui/macro'
import SVG from 'react-inlinesvg'
import { Nullish } from 'types'

import { AccountElement } from 'legacy/components/Header/AccountElement'
import { upToLarge, useMediaQuery } from 'legacy/hooks/useMediaQuery'
import { Field } from 'legacy/state/types'

import { useToggleAccountModal } from 'modules/account'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useOpenTokenSelectWidget } from 'modules/tokensList'
import { useIsAlternativeOrderModalVisible } from 'modules/trade/state/alternativeOrder'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useThrottleFn } from 'common/hooks/useThrottleFn'
import { CurrencyArrowSeparator } from 'common/pure/CurrencyArrowSeparator'
import { CurrencyInputPanel } from 'common/pure/CurrencyInputPanel'
import { PoweredFooter } from 'common/pure/PoweredFooter'

import * as styledEl from './styled'
import { TradeWidgetProps } from './types'

import { useTradeStateFromUrl } from '../../hooks/setupTradeState/useTradeStateFromUrl'
import { useIsCurrentTradeBridging } from '../../hooks/useIsCurrentTradeBridging'
import { useIsEoaEthFlow } from '../../hooks/useIsEoaEthFlow'
import { useIsWrapOrUnwrap } from '../../hooks/useIsWrapOrUnwrap'
import { useLimitOrdersPromoBanner } from '../../hooks/useLimitOrdersPromoBanner'
import { SetRecipient } from '../../pure/SetRecipient'
import { LimitOrdersPromoBannerWrapper } from '../LimitOrdersPromoBannerWrapper'
import { TradeWarnings } from '../TradeWarnings'
import { TradeWidgetLinks } from '../TradeWidgetLinks'
import { WrapFlowActionButton } from '../WrapFlowActionButton'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const scrollToMyOrders = () => {
  const element = document.getElementById(MY_ORDERS_ID)
  if (element) {
    const elementTop = element.getBoundingClientRect().top + window.scrollY - SWAP_HEADER_OFFSET
    window.scrollTo({ top: elementTop, behavior: 'smooth' })
  }
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function TradeWidgetForm(props: TradeWidgetProps) {
  const isInjectedWidgetMode = isInjectedWidget()
  const { standaloneMode, hideOrdersTable } = useInjectedWidgetParams()
  const isMobile = useMediaQuery(Media.upToSmall(false))

  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
  const { pendingActivity } = useCategorizeRecentActivity()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const { isLimitOrdersUpgradeBannerEnabled, isBridgingEnabled } = useFeatureFlags()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()

  const { slots, actions, params, disableOutput } = props
  const { settingsWidget, lockScreen, topContent, middleContent, bottomContent, outerContent } = slots

  const { onCurrencySelection, onUserInput, onSwitchTokens, onChangeRecipient } = actions
  const {
    compactView,
    showRecipient,
    isTradePriceUpdating,
    priceImpact,
    recipient,
    hideTradeWarnings,
    enableSmartSlippage,
    displayTokenName = false,
    displayChainName = isBridgingEnabled && isCurrentTradeBridging,
    isMarketOrderWidget = false,
    isSellingEthSupported = false,
  } = params

  const inputCurrencyInfo = useMemo(
    () => (isWrapOrUnwrap ? { ...props.inputCurrencyInfo, receiveAmountInfo: null } : props.inputCurrencyInfo),
    [isWrapOrUnwrap, props.inputCurrencyInfo],
  )

  const outputCurrencyInfo = useMemo(
    () =>
      isWrapOrUnwrap
        ? { ...props.outputCurrencyInfo, amount: props.inputCurrencyInfo.amount, receiveAmountInfo: null }
        : props.outputCurrencyInfo,
    [isWrapOrUnwrap, props.outputCurrencyInfo, props.inputCurrencyInfo.amount],
  )

  const { chainId, account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const isSafeWallet = useIsSafeWallet()
  const openTokenSelectWidget = useOpenTokenSelectWidget()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const alternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
  const primaryFormValidation = useGetTradeFormValidation()
  const { shouldBeVisible: isLimitOrdersPromoBannerVisible } = useLimitOrdersPromoBanner()
  const isEoaEthFlow = useIsEoaEthFlow()

  const sellToken = inputCurrencyInfo.currency
  const buyToken = outputCurrencyInfo.currency
  const areCurrenciesLoading = !sellToken && !buyToken
  const bothCurrenciesSet = !!sellToken && !!buyToken

  const hasRecipientInUrl = !!tradeStateFromUrl?.recipient
  const withRecipient = !isWrapOrUnwrap && (showRecipient || hasRecipientInUrl)
  const maxBalance = maxAmountSpend(inputCurrencyInfo.balance || undefined, isSafeWallet)
  const showSetMax = maxBalance?.greaterThan(0) && !inputCurrencyInfo.amount?.equalTo(maxBalance)

  const disablePriceImpact =
    !!params.disablePriceImpact ||
    primaryFormValidation === TradeFormValidation.QuoteErrors ||
    primaryFormValidation === TradeFormValidation.CurrencyNotSupported ||
    primaryFormValidation === TradeFormValidation.WrapUnwrapFlow

  // Disable too frequent tokens switching
  const throttledOnSwitchTokens = useThrottleFn(onSwitchTokens, 500)

  const isUpToLarge = useMediaQuery(upToLarge)

  const isConnectedMarketOrderWidget = !!account && isMarketOrderWidget

  const shouldShowMyOrdersButton =
    !alternativeOrderModalVisible &&
    (!isInjectedWidgetMode && isConnectedMarketOrderWidget ? isUpToLarge : true) &&
    (isConnectedMarketOrderWidget || !hideOrdersTable) &&
    ((isConnectedMarketOrderWidget && standaloneMode !== true) || (!isMarketOrderWidget && isUpToLarge && !lockScreen))

  const showDropdown = shouldShowMyOrdersButton || isInjectedWidgetMode || isMobile

  const currencyInputCommonProps = {
    isChainIdUnsupported,
    chainId,
    areCurrenciesLoading,
    bothCurrenciesSet,
    onCurrencySelection,
    onUserInput,
    allowsOffchainSigning,
    tokenSelectorDisabled: alternativeOrderModalVisible,
    displayTokenName,
    displayChainName,
  }

  const openSellTokenSelect = useCallback(
    (selectedToken: Nullish<Currency>, field: Field | undefined, onSelectToken: (currency: Currency) => void) => {
      openTokenSelectWidget(selectedToken, field, buyToken || undefined, onSelectToken)
    },
    [openTokenSelectWidget, buyToken],
  )

  const openBuyTokenSelect = useCallback(
    (selectedToken: Nullish<Currency>, field: Field | undefined, onSelectToken: (currency: Currency) => void) => {
      openTokenSelectWidget(selectedToken, field, sellToken || undefined, onSelectToken)
    },
    [openTokenSelectWidget, sellToken],
  )

  const toggleAccountModal = useToggleAccountModal()

  const handleMyOrdersClick = useCallback(() => {
    if (isMarketOrderWidget) {
      toggleAccountModal()
    } else {
      scrollToMyOrders()
    }
  }, [isMarketOrderWidget, toggleAccountModal])

  const isOutputTokenUnsupported = !!buyToken && !(buyToken.chainId in SupportedChainId)

  return (
    <>
      <styledEl.ContainerBox>
        <styledEl.Header>
          {isAlternativeOrderModalVisible ? <div></div> : <TradeWidgetLinks isDropdown={showDropdown} />}
          {isInjectedWidgetMode && standaloneMode && (
            <AccountElement standaloneMode pendingActivities={pendingActivity} />
          )}

          {shouldShowMyOrdersButton && (
            <ButtonOutlined margin={'0 16px 0 auto'} onClick={handleMyOrdersClick}>
              My orders <SVG src={ICON_ORDERS} />
            </ButtonOutlined>
          )}

          {!lockScreen && settingsWidget}
        </styledEl.Header>

        <LimitOrdersPromoBannerWrapper>
          <>
            {lockScreen ? (
              lockScreen
            ) : (
              <>
                {topContent}
                <div>
                  <CurrencyInputPanel
                    id="input-currency-input"
                    currencyInfo={inputCurrencyInfo}
                    showSetMax={showSetMax}
                    maxBalance={maxBalance}
                    topLabel={isWrapOrUnwrap ? undefined : inputCurrencyInfo.label}
                    topContent={inputCurrencyInfo.topContent}
                    openTokenSelectWidget={openSellTokenSelect}
                    customSelectTokenButton={params.customSelectTokenButton}
                    {...currencyInputCommonProps}
                  />
                </div>
                {!isWrapOrUnwrap && middleContent}

                <styledEl.CurrencySeparatorBox compactView={compactView}>
                  <CurrencyArrowSeparator
                    isCollapsed={compactView}
                    hasSeparatorLine={!compactView}
                    onSwitchTokens={isChainIdUnsupported ? () => void 0 : throttledOnSwitchTokens}
                    isLoading={Boolean(sellToken && outputCurrencyInfo.currency && isTradePriceUpdating)}
                    disabled={isAlternativeOrderModalVisible || isOutputTokenUnsupported}
                  />
                </styledEl.CurrencySeparatorBox>
                <div>
                  <CurrencyInputPanel
                    id="output-currency-input"
                    inputDisabled={
                      (isSellingEthSupported && isEoaEthFlow) ||
                      isWrapOrUnwrap ||
                      isCurrentTradeBridging ||
                      disableOutput
                    }
                    inputTooltip={
                      isSellingEthSupported && isEoaEthFlow
                        ? t`You cannot edit this field when selling ${inputCurrencyInfo?.currency?.symbol}`
                        : undefined
                    }
                    currencyInfo={outputCurrencyInfo}
                    priceImpactParams={!disablePriceImpact ? priceImpact : undefined}
                    topLabel={isWrapOrUnwrap ? undefined : outputCurrencyInfo.label}
                    topContent={outputCurrencyInfo.topContent}
                    openTokenSelectWidget={openBuyTokenSelect}
                    customSelectTokenButton={params.customSelectTokenButton}
                    {...currencyInputCommonProps}
                  />
                </div>
                {withRecipient && <SetRecipient recipient={recipient || ''} onChangeRecipient={onChangeRecipient} />}

                {isWrapOrUnwrap ? (
                  sellToken ? (
                    <WrapFlowActionButton sellToken={sellToken} />
                  ) : null
                ) : (
                  bottomContent?.(
                    hideTradeWarnings ? null : (
                      <TradeWarnings
                        enableSmartSlippage={enableSmartSlippage}
                        isTradePriceUpdating={isTradePriceUpdating}
                      />
                    ),
                  )
                )}
              </>
            )}

            {isInjectedWidgetMode && <PoweredFooter />}
          </>
        </LimitOrdersPromoBannerWrapper>
      </styledEl.ContainerBox>
      {!isLimitOrdersPromoBannerVisible && !isLimitOrdersUpgradeBannerEnabled && outerContent && (
        <styledEl.OuterContentWrapper>{outerContent}</styledEl.OuterContentWrapper>
      )}
    </>
  )
}
