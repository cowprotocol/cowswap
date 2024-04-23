import { useCallback, useMemo, useState } from 'react'

import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { isFractionFalsy } from '@cowprotocol/common-utils'
import { useIsTradeUnsupported } from '@cowprotocol/tokens'
import { useIsSafeViaWc, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { TradeType } from '@cowprotocol/widget-lib'

import { NetworkAlert } from 'legacy/components/NetworkAlert/NetworkAlert'
import SettingsTab from 'legacy/components/Settings'
import useCowBalanceAndSubsidy from 'legacy/hooks/useCowBalanceAndSubsidy'
import { useModalIsOpen } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { Field } from 'legacy/state/types'
import { useUserSlippageTolerance } from 'legacy/state/user/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { EthFlowModal, EthFlowProps } from 'modules/swap/containers/EthFlow'
import { SafeTokenBanner } from 'modules/swap/containers/SafeTokenBanner'
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
import { TradeWidget, TradeWidgetContainer, useTradePriceImpact } from 'modules/trade'
import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { useWrappedToken } from 'modules/trade/hooks/useWrappedToken'
import { getQuoteTimeOffset } from 'modules/tradeQuote'
import { useTradeUsdAmounts } from 'modules/usdAmount'
import { useShouldZeroApprove } from 'modules/zeroApproval'

import { useSetLocalTimeOffset } from 'common/containers/InvalidLocalTimeWarning/localTimeOffsetState'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { SWAP_QUOTE_CHECK_INTERVAL } from 'common/updaters/FeesUpdater'
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
import { ConfirmSwapModalSetup } from '../ConfirmSwapModalSetup'

const BUTTON_STATES_TO_SHOW_BUNDLE_APPROVAL_BANNER = [SwapButtonState.ApproveAndSwap]
const BUTTON_STATES_TO_SHOW_BUNDLE_WRAP_BANNER = [SwapButtonState.WrapAndSwap]

export function SwapWidget() {
  const { chainId, account } = useWalletInfo()
  const { slippageAdjustedSellAmount, allowedSlippage, currencies, currenciesIds, trade } = useDerivedSwapInfo()
  const parsedAmounts = useSwapCurrenciesAmounts()
  const { isSupportedWallet, allowsOffchainSigning } = useWalletDetails()
  const isSwapUnsupported = useIsTradeUnsupported(currencies.INPUT, currencies.OUTPUT)
  const swapActions = useSwapActionHandlers()
  const subsidyAndBalance = useCowBalanceAndSubsidy()
  const userAllowedSlippage = useUserSlippageTolerance()
  const swapState = useSwapState()
  const { independentField, recipient } = swapState
  const showRecipientControls = useShowRecipientControls(recipient)
  const isEoaEthFlow = useIsEoaEthFlow()
  const shouldZeroApprove = useShouldZeroApprove(slippageAdjustedSellAmount)
  const widgetParams = useInjectedWidgetParams()
  const priceImpactParams = useTradePriceImpact()

  const isTradePriceUpdating = useTradePricesUpdate()
  const { isFeeGreater, fee } = useIsFeeGreaterThanInput({
    chainId,
    address: currenciesIds.INPUT,
    trade,
  })

  const inputToken = useMemo(() => {
    if (!currencies.INPUT) return currencies.INPUT

    if (currencies.INPUT.isNative) return NATIVE_CURRENCIES[chainId]

    return TokenWithLogo.fromToken(currencies.INPUT)
  }, [chainId, currencies.INPUT])

  const outputToken = useMemo(() => {
    if (!currencies.OUTPUT) return currencies.OUTPUT

    if (currencies.OUTPUT.isNative) return NATIVE_CURRENCIES[chainId]

    return TokenWithLogo.fromToken(currencies.OUTPUT)
  }, [chainId, currencies.OUTPUT])

  const inputCurrencyBalance = useCurrencyAmountBalance(inputToken) || null
  const outputCurrencyBalance = useCurrencyAmountBalance(outputToken) || null

  const isSellTrade = independentField === Field.INPUT

  const {
    inputAmount: { value: inputUsdValue },
    outputAmount: { value: outputUsdValue },
  } = useTradeUsdAmounts(
    trade?.inputAmountWithoutFee || parsedAmounts.INPUT,
    trade?.outputAmountWithoutFee || parsedAmounts.OUTPUT,
    inputToken,
    outputToken,
    true
  )

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

  const inputCurrencyPreviewInfo = {
    amount: inputCurrencyInfo.amount,
    fiatAmount: inputCurrencyInfo.fiatAmount,
    balance: inputCurrencyInfo.balance,
    label: isSellTrade ? 'Sell amount' : 'Expected sell amount',
  }

  const outputCurrencyPreviewInfo = {
    amount: outputCurrencyInfo.amount,
    fiatAmount: outputCurrencyInfo.fiatAmount,
    balance: outputCurrencyInfo.balance,
    label: isSellTrade ? 'Receive (before fees)' : 'Buy exactly',
  }

  const buyingFiatAmount = useMemo(
    () => (isSellTrade ? outputCurrencyInfo.fiatAmount : inputCurrencyInfo.fiatAmount),
    [isSellTrade, outputCurrencyInfo.fiatAmount, inputCurrencyInfo.fiatAmount]
  )

  const [showNativeWrapModal, setOpenNativeWrapModal] = useState(false)
  const showCowSubsidyModal = useModalIsOpen(ApplicationModal.COW_SUBSIDY)

  // Hide the price impact warning when there is priceImpact value or when it's loading
  // The loading values is debounced in useFiatValuePriceImpact() to avoid flickering
  const hideUnknownImpactWarning =
    isFractionFalsy(parsedAmounts.INPUT) ||
    isFractionFalsy(parsedAmounts.OUTPUT) ||
    !!priceImpactParams.priceImpact ||
    priceImpactParams.loading

  const { feeWarningAccepted, setFeeWarningAccepted } = useHighFeeWarning(trade)
  const { impactWarningAccepted: _impactWarningAccepted, setImpactWarningAccepted } = useUnknownImpactWarning()
  const impactWarningAccepted = hideUnknownImpactWarning || _impactWarningAccepted

  const openNativeWrapModal = useCallback(() => setOpenNativeWrapModal(true), [])
  const dismissNativeWrapModal = useCallback(() => setOpenNativeWrapModal(false), [])

  const swapButtonContext = useSwapButtonContext({
    feeWarningAccepted,
    impactWarningAccepted,
    openNativeWrapModal,
    priceImpactParams,
  })

  const tradeUrlParams = useTradeRouteContext()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

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
  }

  const showApprovalBundlingBanner = BUTTON_STATES_TO_SHOW_BUNDLE_APPROVAL_BANNER.includes(
    swapButtonContext.swapButtonState
  )
  const showWrapBundlingBanner = BUTTON_STATES_TO_SHOW_BUNDLE_WRAP_BANNER.includes(swapButtonContext.swapButtonState)

  const isSafeViaWc = useIsSafeViaWc()
  const isSwapEth = useIsSwapEth()

  const showSafeWcApprovalBundlingBanner =
    !showApprovalBundlingBanner && isSafeViaWc && swapButtonContext.swapButtonState === SwapButtonState.NeedApprove

  const showSafeWcWrapBundlingBanner = !showWrapBundlingBanner && isSafeViaWc && isSwapEth

  // Show the same banner when approval is needed or selling native token
  const showSafeWcBundlingBanner =
    (showSafeWcApprovalBundlingBanner || showSafeWcWrapBundlingBanner) && !widgetParams.banners?.hideSafeWebAppBanner

  const showTwapSuggestionBanner =
    !widgetParams.enabledTradeTypes || widgetParams.enabledTradeTypes.includes(TradeType.ADVANCED)

  const nativeCurrencySymbol = useNativeCurrency().symbol || 'ETH'
  const wrappedCurrencySymbol = useWrappedToken().symbol || 'WETH'

  const swapWarningsTopProps: SwapWarningsTopProps = {
    chainId,
    trade,
    account,
    feeWarningAccepted,
    impactWarningAccepted,
    hideUnknownImpactWarning,
    showApprovalBundlingBanner,
    showWrapBundlingBanner,
    showSafeWcBundlingBanner,
    showTwapSuggestionBanner,
    nativeCurrencySymbol,
    wrappedCurrencySymbol,
    setFeeWarningAccepted,
    setImpactWarningAccepted,
    shouldZeroApprove,
    buyingFiatAmount,
    priceImpact: priceImpactParams.priceImpact,
    tradeUrlParams,
    isFeeGreater,
  }

  const swapWarningsBottomProps: SwapWarningsBottomProps = {
    isSupportedWallet,
    swapIsUnsupported: isSwapUnsupported,
    currencyIn: currencies.INPUT || undefined,
    currencyOut: currencies.OUTPUT || undefined,
  }

  const tradeRatesProps: TradeRatesProps = {
    trade,
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
        <SafeTokenBanner sellTokenAddress={inputToken?.address} buyTokenAddress={outputToken?.address} />
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
    disablePriceImpact,
  }

  useSetLocalTimeOffset(getQuoteTimeOffset(swapButtonContext.quoteDeadlineParams))

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
          confirmModal={
            <ConfirmSwapModalSetup
              chainId={chainId}
              recipientAddressOrName={swapButtonContext.recipientAddressOrName}
              doTrade={swapButtonContext.handleSwap}
              priceImpact={priceImpactParams}
              inputCurrencyInfo={inputCurrencyPreviewInfo}
              outputCurrencyInfo={outputCurrencyPreviewInfo}
              tradeRatesProps={tradeRatesProps}
              refreshInterval={SWAP_QUOTE_CHECK_INTERVAL}
            />
          }
          genericModal={showNativeWrapModal && <EthFlowModal {...ethFlowProps} />}
        />
        <NetworkAlert />
      </TradeWidgetContainer>
    </>
  )
}
