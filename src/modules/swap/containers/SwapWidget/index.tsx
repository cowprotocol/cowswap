import { useSwapState } from 'legacy/state/swap/hooks'
import {
  useDerivedSwapInfo,
  useHighFeeWarning,
  useIsFeeGreaterThanInput,
  useSwapActionHandlers,
  useUnknownImpactWarning,
} from 'legacy/state/swap/hooks'
import { useWrapType, WrapType } from 'legacy/hooks/useWrapCallback'
import { useSwapCurrenciesAmounts } from 'modules/swap/hooks/useSwapCurrenciesAmounts'
import { useIsSafeViaWc, useWalletDetails, useWalletInfo } from 'modules/wallet'
import { useExpertModeManager, useUserSlippageTolerance } from 'legacy/state/user/hooks'
import useCowBalanceAndSubsidy from 'legacy/hooks/useCowBalanceAndSubsidy'
import { useShowRecipientControls } from 'modules/swap/hooks/useShowRecipientControls'
import usePriceImpact from 'legacy/hooks/usePriceImpact'
import { useTradePricesUpdate } from 'modules/swap/hooks/useTradePricesUpdate'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { Field } from 'legacy/state/swap/actions'
import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'
import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from 'modules/swap/helpers/tradeReceiveAmount'
import React, { useState } from 'react'
import { useModalIsOpen } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useSwapButtonContext } from 'modules/swap/hooks/useSwapButtonContext'
import { ConfirmSwapModalSetupProps } from 'modules/swap/containers/ConfirmSwapModalSetup'
import { EthFlowProps } from 'modules/swap/containers/EthFlow'
import { SwapModals, SwapModalsProps } from 'modules/swap/containers/SwapModals'
import {
  SwapWarningsBottom,
  SwapWarningsBottomProps,
  SwapWarningsTop,
  SwapWarningsTopProps,
} from 'modules/swap/pure/warnings'
import { TradeRates, TradeRatesProps } from 'modules/swap/pure/TradeRates'
import { SwapButtons } from 'modules/swap/pure/SwapButtons'
import { useSetupTradeState } from 'modules/trade'
import { NetworkAlert } from 'legacy/components/NetworkAlert/NetworkAlert'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { useSetupSwapAmountsFromUrl } from 'modules/swap/hooks/useSetupSwapAmountsFromUrl'
import { useIsTradeUnsupported } from 'legacy/state/lists/hooks'
import useCurrencyBalance from 'modules/tokens/hooks/useCurrencyBalance'
import { TradeWidget, TradeWidgetContainer } from 'modules/trade/containers/TradeWidget'
import SettingsTab from 'legacy/components/Settings'
import { SwapButtonState } from 'modules/swap/helpers/getSwapButtonState'
import { useIsEthFlow } from 'modules/swap/hooks/useIsEthFlow'
import { useFillSwapDerivedState } from 'modules/swap/state/useSwapDerivedState'
import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'

const BUTTON_STATES_TO_SHOW_BUNDLE_BANNER = [SwapButtonState.ApproveAndSwap, SwapButtonState.ExpertApproveAndSwap]

export function SwapWidget() {
  useSetupTradeState()
  useSetupSwapAmountsFromUrl()
  useFillSwapDerivedState()

  const { chainId, account } = useWalletInfo()
  const {
    slippageAdjustedSellAmount,
    allowedSlippage,
    currencies,
    currenciesIds,
    v2Trade: trade,
  } = useDerivedSwapInfo()
  const wrapType = useWrapType()
  const parsedAmounts = useSwapCurrenciesAmounts(wrapType)
  const { isSupportedWallet, allowsOffchainSigning } = useWalletDetails()
  const isSwapUnsupported = useIsTradeUnsupported(currencies.INPUT, currencies.OUTPUT)
  const [isExpertMode] = useExpertModeManager()
  const swapActions = useSwapActionHandlers()
  const subsidyAndBalance = useCowBalanceAndSubsidy()
  const userAllowedSlippage = useUserSlippageTolerance()
  const swapState = useSwapState()
  const { independentField, recipient } = swapState
  const showRecipientControls = useShowRecipientControls(recipient)
  const isEthFlow = useIsEthFlow()
  const shouldZeroApprove = useShouldZeroApprove(slippageAdjustedSellAmount)

  const isWrapUnwrapMode = wrapType !== WrapType.NOT_APPLICABLE
  const priceImpactParams = usePriceImpact({
    abTrade: trade,
    parsedAmounts,
    isWrapping: isWrapUnwrapMode,
  })

  const isTradePriceUpdating = useTradePricesUpdate()
  const { isFeeGreater, fee } = useIsFeeGreaterThanInput({
    chainId,
    address: currenciesIds.INPUT,
  })

  const inputCurrencyBalance = useCurrencyBalance(account ?? undefined, currencies.INPUT) || null
  const outputCurrencyBalance = useCurrencyBalance(account ?? undefined, currencies.OUTPUT) || null

  // TODO: unify CurrencyInfo assembling between Swap and Limit orders
  // TODO: delegate formatting to the view layer
  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: currencies.INPUT || null,
    amount: parsedAmounts.INPUT || null,
    isIndependent: independentField === Field.INPUT,
    balance: inputCurrencyBalance,
    fiatAmount: useHigherUSDValue(trade?.inputAmountWithoutFee),
    receiveAmountInfo: independentField === Field.OUTPUT && trade ? getInputReceiveAmountInfo(trade) : null,
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: currencies.OUTPUT || null,
    amount: parsedAmounts.OUTPUT || null,
    isIndependent: independentField === Field.OUTPUT,
    balance: outputCurrencyBalance,
    fiatAmount: useHigherUSDValue(trade?.outputAmountWithoutFee),
    receiveAmountInfo: independentField === Field.INPUT && trade ? getOutputReceiveAmountInfo(trade) : null,
  }

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

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  const confirmSwapProps: ConfirmSwapModalSetupProps = {
    trade,
    recipient,
    allowedSlippage,
    handleSwap: swapButtonContext.handleSwap,
    priceImpact: priceImpactParams.priceImpact,
    dismissNativeWrapModal,
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

  const showApprovalBundlingBanner = BUTTON_STATES_TO_SHOW_BUNDLE_BANNER.includes(swapButtonContext.swapButtonState)

  const isSafeViaWc = useIsSafeViaWc()
  const showSafeWcBundlingBanner =
    !showApprovalBundlingBanner && isSafeViaWc && swapButtonContext.swapButtonState === SwapButtonState.NeedApprove

  const swapWarningsTopProps: SwapWarningsTopProps = {
    trade,
    account,
    feeWarningAccepted,
    impactWarningAccepted,
    // don't show the unknown impact warning on: no trade, wrapping native, no error, or it's loading impact
    hideUnknownImpactWarning: !trade || isWrapUnwrapMode || !priceImpactParams.error || priceImpactParams.loading,
    isExpertMode,
    showApprovalBundlingBanner,
    showSafeWcBundlingBanner,
    setFeeWarningAccepted,
    setImpactWarningAccepted,
    shouldZeroApprove,
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

  const showTradeRates = !isWrapUnwrapMode

  const slots = {
    settingsWidget: <SettingsTab placeholderSlippage={allowedSlippage} />,
    bottomContent: (
      <>
        {showTradeRates && <TradeRates {...tradeRatesProps} />}
        <SwapWarningsTop {...swapWarningsTopProps} />
        <SwapButtons {...swapButtonContext} />
        <SwapWarningsBottom {...swapWarningsBottomProps} />
      </>
    ),
  }

  const params = {
    isEthFlow,
    compactView: true,
    recipient,
    showRecipient: showRecipientControls,
    isTradePriceUpdating,
    priceImpact: priceImpactParams,
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
