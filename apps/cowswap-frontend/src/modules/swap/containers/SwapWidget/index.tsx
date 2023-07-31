import React, { useMemo, useState } from 'react'

import { NetworkAlert } from '../../../../legacy/components/NetworkAlert/NetworkAlert'
import SettingsTab from '../../../../legacy/components/Settings'
import useCowBalanceAndSubsidy from '../../../../legacy/hooks/useCowBalanceAndSubsidy'
import { useHigherUSDValue } from '../../../../legacy/hooks/useStablecoinPrice'
import { useModalIsOpen } from '../../../../legacy/state/application/hooks'
import { ApplicationModal } from '../../../../legacy/state/application/reducer'
import { useIsTradeUnsupported } from '../../../../legacy/state/lists/hooks'
import { Field } from '../../../../legacy/state/swap/actions'
import {
  useDerivedSwapInfo,
  useHighFeeWarning,
  useIsFeeGreaterThanInput,
  useSwapActionHandlers,
  useSwapState,
  useUnknownImpactWarning,
} from '../../../../legacy/state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance } from '../../../../legacy/state/user/hooks'

import { ConfirmSwapModalSetupProps } from '../ConfirmSwapModalSetup'
import { EthFlowProps } from '../EthFlow'
import { SwapModals, SwapModalsProps } from '../SwapModals'
import { SwapButtonState } from '../../helpers/getSwapButtonState'
import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from '../../helpers/tradeReceiveAmount'
import { useIsEoaEthFlow } from '../../hooks/useIsEoaEthFlow'
import { useShowRecipientControls } from '../../hooks/useShowRecipientControls'
import { useSwapButtonContext } from '../../hooks/useSwapButtonContext'
import { useSwapCurrenciesAmounts } from '../../hooks/useSwapCurrenciesAmounts'
import { useTradePricesUpdate } from '../../hooks/useTradePricesUpdate'
import { SwapButtons } from '../../pure/SwapButtons'
import { TradeRates, TradeRatesProps } from '../../pure/TradeRates'
import {
  SwapWarningsBottom,
  SwapWarningsBottomProps,
  SwapWarningsTop,
  SwapWarningsTopProps,
} from '../../pure/warnings'
import useCurrencyBalance from '../../../tokens/hooks/useCurrencyBalance'
import { TradeWidget, TradeWidgetContainer, useTradePriceImpact } from '../../../trade'
import { useTradeRouteContext } from '../../../trade/hooks/useTradeRouteContext'
import { useWrappedToken } from '../../../trade/hooks/useWrappedToken'
import { useIsSafeViaWc, useWalletDetails, useWalletInfo } from '../../../wallet'

import { useRateInfoParams } from '../../../../common/hooks/useRateInfoParams'
import { useShouldZeroApprove } from '../../../../common/hooks/useShouldZeroApprove'
import { CurrencyInfo } from '../../../../common/pure/CurrencyInputPanel/types'
import useNativeCurrency from '../../../../lib/hooks/useNativeCurrency'

import { useIsSwapEth } from '../../hooks/useIsSwapEth'

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

  // TODO: unify CurrencyInfo assembling between Swap and Limit orders
  // TODO: delegate formatting to the view layer
  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: currencies.INPUT || null,
    amount: parsedAmounts.INPUT || null,
    isIndependent: isSellTrade,
    balance: inputCurrencyBalance,
    fiatAmount: useHigherUSDValue(trade?.inputAmountWithoutFee),
    receiveAmountInfo: !isSellTrade && trade ? getInputReceiveAmountInfo(trade) : null,
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: currencies.OUTPUT || null,
    amount: parsedAmounts.OUTPUT || null,
    isIndependent: !isSellTrade,
    balance: outputCurrencyBalance,
    fiatAmount: useHigherUSDValue(trade?.outputAmountWithoutFee),
    receiveAmountInfo: isSellTrade && trade ? getOutputReceiveAmountInfo(trade) : null,
  }

  const buyingFiatAmount = useMemo(
    () => (isSellTrade ? outputCurrencyInfo.fiatAmount : inputCurrencyInfo.fiatAmount),
    [isSellTrade, outputCurrencyInfo.fiatAmount, inputCurrencyInfo.fiatAmount]
  )

  const [showNativeWrapModal, setOpenNativeWrapModal] = useState(false)
  const showCowSubsidyModal = useModalIsOpen(ApplicationModal.COW_SUBSIDY)

  const { feeWarningAccepted, setFeeWarningAccepted } = useHighFeeWarning(trade)
  const { impactWarningAccepted, setImpactWarningAccepted } = useUnknownImpactWarning(priceImpactParams)

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

  const swapWarningsTopProps: SwapWarningsTopProps = {
    chainId,
    trade,
    account,
    feeWarningAccepted,
    impactWarningAccepted,
    // don't show the unknown impact warning on: no trade, wrapping native, no error, or it's loading impact
    hideUnknownImpactWarning: !trade || !priceImpactParams.error || priceImpactParams.loading,
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

  const params = {
    isEoaEthFlow,
    compactView: true,
    recipient,
    showRecipient: showRecipientControls,
    isTradePriceUpdating,
    priceImpact: priceImpactParams,
    disableQuotePolling: true,
    isExpertMode,
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
        <NetworkAlert />
      </TradeWidgetContainer>
    </>
  )
}
