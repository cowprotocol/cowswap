import React, { useMemo, useState } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { Layer3Banner } from '@cowprotocol/ui'
import { useIsSafeViaWc, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { NetworkAlert } from 'legacy/components/NetworkAlert/NetworkAlert'
import SettingsTab from 'legacy/components/Settings'
import useCowBalanceAndSubsidy from 'legacy/hooks/useCowBalanceAndSubsidy'
import { useModalIsOpen } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useIsTradeUnsupported } from 'legacy/state/lists/hooks'
import { Field } from 'legacy/state/types'
import { useExpertModeManager, useUserSlippageTolerance } from 'legacy/state/user/hooks'

import { ConfirmSwapModalSetupProps } from 'modules/swap/containers/ConfirmSwapModalSetup'
import { EthFlowProps } from 'modules/swap/containers/EthFlow'
import { SwapModals, SwapModalsProps } from 'modules/swap/containers/SwapModals'
import { SwapButtonState } from 'modules/swap/helpers/getSwapButtonState'
import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from 'modules/swap/helpers/tradeReceiveAmount'
import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { useShowRecipientControls } from 'modules/swap/hooks/useShowRecipientControls'
import { useSwapButtonContext } from 'modules/swap/hooks/useSwapButtonContext'
import { useSwapCurrenciesAmounts } from 'modules/swap/hooks/useSwapCurrenciesAmounts'
import { useTradePricesUpdate } from 'modules/swap/hooks/useTradePricesUpdate'
import { SwapButtons } from 'modules/swap/pure/SwapButtons'
import { TradeRates, TradeRatesProps } from 'modules/swap/pure/TradeRates'
import {
  SwapWarningsBottom,
  SwapWarningsBottomProps,
  SwapWarningsTop,
  SwapWarningsTopProps,
} from 'modules/swap/pure/warnings'
import useCurrencyBalance from 'modules/tokens/hooks/useCurrencyBalance'
import { TradeWidget, TradeWidgetContainer, useTradePriceImpact } from 'modules/trade'
import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { useWrappedToken } from 'modules/trade/hooks/useWrappedToken'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { FeatureGuard } from 'common/containers/FeatureGuard'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useIsSwapEth } from '../../hooks/useIsSwapEth'
import {
  useDerivedSwapInfo,
  useHighFeeWarning,
  useIsFeeGreaterThanInput,
  useSwapActionHandlers,
  useSwapState,
  useUnknownImpactWarning,
} from '../../hooks/useSwapState'

const BUTTON_STATES_TO_SHOW_BUNDLE_APPROVAL_BANNER = [
  SwapButtonState.ApproveAndSwap,
  SwapButtonState.ExpertApproveAndSwap,
]
const BUTTON_STATES_TO_SHOW_BUNDLE_WRAP_BANNER = [SwapButtonState.WrapAndSwap, SwapButtonState.ExpertWrapAndSwap]

export function SwapWidget() {
  const { chainId, account } = useWalletInfo()
  const {
    slippageAdjustedSellAmount,
    allowedSlippage,
    currencies,
    currenciesIds,
    v2Trade: trade,
  } = useDerivedSwapInfo()
  const parsedAmounts = useSwapCurrenciesAmounts()
  const { isSupportedWallet, allowsOffchainSigning } = useWalletDetails()
  const isSwapUnsupported = useIsTradeUnsupported(currencies.INPUT, currencies.OUTPUT)
  const [isExpertMode] = useExpertModeManager()
  const swapActions = useSwapActionHandlers()
  const subsidyAndBalance = useCowBalanceAndSubsidy()
  const userAllowedSlippage = useUserSlippageTolerance()
  const swapState = useSwapState()
  const { independentField, recipient } = swapState
  const showRecipientControls = useShowRecipientControls(recipient)
  const isEoaEthFlow = useIsEoaEthFlow()
  const shouldZeroApprove = useShouldZeroApprove(slippageAdjustedSellAmount)

  const priceImpactParams = useTradePriceImpact()

  const isTradePriceUpdating = useTradePricesUpdate()
  const { isFeeGreater, fee } = useIsFeeGreaterThanInput({
    chainId,
    address: currenciesIds.INPUT,
  })

  const inputCurrencyBalance = useCurrencyBalance(account ?? undefined, currencies.INPUT) || null
  const outputCurrencyBalance = useCurrencyBalance(account ?? undefined, currencies.OUTPUT) || null
  const isSellTrade = independentField === Field.INPUT

  const {
    inputAmount: { value: inputUsdValue },
    outputAmount: { value: outputUsdValue },
  } = useTradeUsdAmounts(trade?.inputAmountWithoutFee, trade?.outputAmountWithoutFee)

  // TODO: unify CurrencyInfo assembling between Swap and Limit orders
  // TODO: delegate formatting to the view layer
  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: currencies.INPUT || null,
    amount: parsedAmounts.INPUT || null,
    isIndependent: isSellTrade,
    balance: inputCurrencyBalance,
    fiatAmount: inputUsdValue,
    receiveAmountInfo: !isSellTrade && trade ? getInputReceiveAmountInfo(trade) : null,
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: currencies.OUTPUT || null,
    amount: parsedAmounts.OUTPUT || null,
    isIndependent: !isSellTrade,
    balance: outputCurrencyBalance,
    fiatAmount: outputUsdValue,
    receiveAmountInfo: isSellTrade && trade ? getOutputReceiveAmountInfo(trade) : null,
  }

  const buyingFiatAmount = useMemo(
    () => (isSellTrade ? outputCurrencyInfo.fiatAmount : inputCurrencyInfo.fiatAmount),
    [isSellTrade, outputCurrencyInfo.fiatAmount, inputCurrencyInfo.fiatAmount]
  )

  const [showNativeWrapModal, setOpenNativeWrapModal] = useState(false)
  const showCowSubsidyModal = useModalIsOpen(ApplicationModal.COW_SUBSIDY)

  const { feeWarningAccepted, setFeeWarningAccepted } = useHighFeeWarning(trade)
  const { impactWarningAccepted, setImpactWarningAccepted } = useUnknownImpactWarning()

  const openNativeWrapModal = () => setOpenNativeWrapModal(true)
  const dismissNativeWrapModal = () => setOpenNativeWrapModal(false)

  const swapButtonContext = useSwapButtonContext({
    feeWarningAccepted,
    impactWarningAccepted,
    openNativeWrapModal,
    priceImpactParams,
  })

  const tradeUrlParams = useTradeRouteContext()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  const confirmSwapProps: ConfirmSwapModalSetupProps = {
    trade,
    recipient,
    allowedSlippage,
    handleSwap: swapButtonContext.handleSwap,
    priceImpact: priceImpactParams.priceImpact,
    rateInfoParams,
  }

  const ethFlowProps: EthFlowProps = {
    nativeInput: parsedAmounts.INPUT,
    onDismiss: dismissNativeWrapModal,
    wrapCallback: swapButtonContext.onWrapOrUnwrap,
    directSwapCallback: swapButtonContext.handleSwap,
    hasEnoughWrappedBalanceForSwap: swapButtonContext.hasEnoughWrappedBalanceForSwap,
  }

  const swapModalsProps: SwapModalsProps = {
    showNativeWrapModal,
    showCowSubsidyModal,
    confirmSwapProps,
    ethFlowProps,
  }

  const showApprovalBundlingBanner = BUTTON_STATES_TO_SHOW_BUNDLE_APPROVAL_BANNER.includes(
    swapButtonContext.swapButtonState
  )
  const showWrapBundlingBanner = BUTTON_STATES_TO_SHOW_BUNDLE_WRAP_BANNER.includes(swapButtonContext.swapButtonState)

  const isSafeViaWc = useIsSafeViaWc()

  const showSafeWcApprovalBundlingBanner =
    !showApprovalBundlingBanner && isSafeViaWc && swapButtonContext.swapButtonState === SwapButtonState.NeedApprove

  const isSwapEth = useIsSwapEth()
  const showSafeWcWrapBundlingBanner = !showWrapBundlingBanner && isSafeViaWc && isSwapEth

  // Show the same banner when approval is needed or selling native token
  const showSafeWcBundlingBanner = showSafeWcApprovalBundlingBanner || showSafeWcWrapBundlingBanner

  const nativeCurrencySymbol = useNativeCurrency().symbol || 'ETH'
  const wrappedCurrencySymbol = useWrappedToken().symbol || 'WETH'

  // Hide the price impact warning when there is priceImpact value or when it's loading
  // The loading values is debounced in useFiatValuePriceImpact() to avoid flickering
  const hideUnknownImpactWarning =
    isFractionFalsy(parsedAmounts.INPUT) ||
    isFractionFalsy(parsedAmounts.OUTPUT) ||
    !!priceImpactParams.priceImpact ||
    priceImpactParams.loading

  const swapWarningsTopProps: SwapWarningsTopProps = {
    chainId,
    trade,
    account,
    feeWarningAccepted,
    impactWarningAccepted,
    hideUnknownImpactWarning,
    isExpertMode,
    showApprovalBundlingBanner,
    showWrapBundlingBanner,
    showSafeWcBundlingBanner,
    nativeCurrencySymbol,
    wrappedCurrencySymbol,
    setFeeWarningAccepted,
    setImpactWarningAccepted,
    shouldZeroApprove,
    buyingFiatAmount,
    priceImpact: priceImpactParams.priceImpact,
    tradeUrlParams,
  }

  const swapWarningsBottomProps: SwapWarningsBottomProps = {
    isSupportedWallet,
    swapIsUnsupported: isSwapUnsupported,
    currencyIn: currencies.INPUT || undefined,
    currencyOut: currencies.OUTPUT || undefined,
  }

  const tradeRatesProps: TradeRatesProps = {
    trade,
    isExpertMode,
    allowedSlippage,
    allowsOffchainSigning,
    userAllowedSlippage,
    isFeeGreater,
    fee,
    discount: subsidyAndBalance.subsidy.discount || 0,
    rateInfoParams,
  }

  const slots = {
    settingsWidget: <SettingsTab placeholderSlippage={allowedSlippage} />,
    bottomContent: (
      <>
        <TradeRates {...tradeRatesProps} />
        <SwapWarningsTop {...swapWarningsTopProps} />
        <SwapButtons {...swapButtonContext} />
        <SwapWarningsBottom {...swapWarningsBottomProps} />
      </>
    ),
  }

  const disablePriceImpact = isFeeGreater

  const params = {
    isEoaEthFlow,
    compactView: true,
    recipient,
    showRecipient: showRecipientControls,
    isTradePriceUpdating,
    priceImpact: priceImpactParams,
    disableQuotePolling: true,
    isExpertMode,
    disablePriceImpact,
  }

  return (
    <>
      <SwapModals {...swapModalsProps} />
      <TradeWidgetContainer>
        <TradeWidget
          id="swap-page"
          slots={slots}
          actions={swapActions}
          params={params}
          inputCurrencyInfo={inputCurrencyInfo}
          outputCurrencyInfo={outputCurrencyInfo}
        />
        <FeatureGuard featureFlag="layer3BannerEnabled">
          <Layer3Banner addMargin={true} />
        </FeatureGuard>

        <NetworkAlert />
      </TradeWidgetContainer>
    </>
  )
}
