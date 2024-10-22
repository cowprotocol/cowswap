import { ReactNode, useCallback, useMemo, useState } from 'react'

// import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsTradeUnsupported } from '@cowprotocol/tokens'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { TradeType } from '@cowprotocol/widget-lib'

import { NetworkAlert } from 'legacy/components/NetworkAlert/NetworkAlert'
import { useModalIsOpen } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { Field } from 'legacy/state/types'
import { useRecipientToggleManager, useUserTransactionTTL } from 'legacy/state/user/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { EthFlowModal, EthFlowProps } from 'modules/swap/containers/EthFlow'
import { SwapModals, SwapModalsProps } from 'modules/swap/containers/SwapModals'
import { useCurrencyAmountBalanceCombined } from 'modules/swap/hooks/useCurrencyAmountBalanceCombined'
import { useShowRecipientControls } from 'modules/swap/hooks/useShowRecipientControls'
import { useSwapButtonContext } from 'modules/swap/hooks/useSwapButtonContext'
import { useSwapCurrenciesAmounts } from 'modules/swap/hooks/useSwapCurrenciesAmounts'
import { useTradePricesUpdate } from 'modules/swap/hooks/useTradePricesUpdate'
import { SwapButtons } from 'modules/swap/pure/SwapButtons'
import {
  SwapWarningsBottom,
  SwapWarningsBottomProps,
  SwapWarningsTop,
  SwapWarningsTopProps,
} from 'modules/swap/pure/warnings'
import {
  TradeWidget,
  TradeWidgetContainer,
  TradeWidgetSlots,
  useReceiveAmountInfo,
  useTradePriceImpact,
} from 'modules/trade'
import {
  useIsEoaEthFlow,
  useTradeRouteContext,
  useUnknownImpactWarning,
  useIsNoImpactWarningAccepted,
} from 'modules/trade'
import { getQuoteTimeOffset } from 'modules/tradeQuote'
import { useTradeSlippage } from 'modules/tradeSlippage'
import { SettingsTab, TradeRateDetails, useHighFeeWarning } from 'modules/tradeWidgetAddons'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSetLocalTimeOffset } from 'common/containers/InvalidLocalTimeWarning/localTimeOffsetState'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { SWAP_QUOTE_CHECK_INTERVAL } from 'common/updaters/FeesUpdater'

import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from '../../hooks/useSwapState'
import { useTradeQuoteStateFromLegacy } from '../../hooks/useTradeQuoteStateFromLegacy'
import { ConfirmSwapModalSetup } from '../ConfirmSwapModalSetup'

export interface SwapWidgetProps {
  topContent?: ReactNode
  bottomContent?: ReactNode
}

export function SwapWidget({ topContent, bottomContent }: SwapWidgetProps) {
  const { chainId } = useWalletInfo()
  const { currencies, trade } = useDerivedSwapInfo()
  const slippage = useTradeSlippage()
  const parsedAmounts = useSwapCurrenciesAmounts()
  const { isSupportedWallet } = useWalletDetails()
  const isSwapUnsupported = useIsTradeUnsupported(currencies.INPUT, currencies.OUTPUT)
  const swapActions = useSwapActionHandlers()
  const swapState = useSwapState()
  const { independentField, recipient } = swapState
  const showRecipientControls = useShowRecipientControls(recipient)
  const isEoaEthFlow = useIsEoaEthFlow()
  const widgetParams = useInjectedWidgetParams()
  const { enabledTradeTypes } = widgetParams
  const priceImpactParams = useTradePriceImpact()
  const tradeQuoteStateOverride = useTradeQuoteStateFromLegacy()
  const receiveAmountInfo = useReceiveAmountInfo()
  const recipientToggleState = useRecipientToggleManager()
  const deadlineState = useUserTransactionTTL()

  const isTradePriceUpdating = useTradePricesUpdate()

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

  const inputCurrencyBalance = useCurrencyAmountBalanceCombined(inputToken) || null
  const outputCurrencyBalance = useCurrencyAmountBalanceCombined(outputToken) || null

  const isSellTrade = independentField === Field.INPUT

  const {
    inputAmount: { value: inputUsdValue },
    outputAmount: { value: outputUsdValue },
  } = useTradeUsdAmounts(
    trade?.inputAmountWithoutFee || parsedAmounts.INPUT,
    trade?.outputAmountWithoutFee || parsedAmounts.OUTPUT,
    inputToken,
    outputToken,
    true,
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
    receiveAmountInfo: !isSellTrade ? receiveAmountInfo : null,
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: currencies.OUTPUT || null,
    amount: parsedAmounts.OUTPUT || null,
    isIndependent: !isSellTrade,
    balance: outputCurrencyBalance,
    fiatAmount: outputUsdValue,
    receiveAmountInfo: isSellTrade ? receiveAmountInfo : null,
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
    [isSellTrade, outputCurrencyInfo.fiatAmount, inputCurrencyInfo.fiatAmount],
  )

  const [showNativeWrapModal, setOpenNativeWrapModal] = useState(false)
  const showCowSubsidyModal = useModalIsOpen(ApplicationModal.COW_SUBSIDY)

  const { feeWarningAccepted } = useHighFeeWarning()
  const noImpactWarningAccepted = useIsNoImpactWarningAccepted()
  const { impactWarningAccepted: unknownImpactWarning } = useUnknownImpactWarning()
  const impactWarningAccepted = noImpactWarningAccepted || unknownImpactWarning

  const openNativeWrapModal = useCallback(() => setOpenNativeWrapModal(true), [])
  const dismissNativeWrapModal = useCallback(() => setOpenNativeWrapModal(false), [])

  const swapButtonContext = useSwapButtonContext({
    feeWarningAccepted,
    impactWarningAccepted,
    openNativeWrapModal,
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
  const showTwapSuggestionBanner = !enabledTradeTypes || enabledTradeTypes.includes(TradeType.ADVANCED)

  const swapWarningsTopProps: SwapWarningsTopProps = {
    chainId,
    trade,
    showTwapSuggestionBanner,
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

  const slots: TradeWidgetSlots = {
    settingsWidget: <SettingsTab recipientToggleState={recipientToggleState} deadlineState={deadlineState} />,

    topContent,
    bottomContent: useCallback(
      (warnings: ReactNode | null) => {
        return (
          <>
            {bottomContent}
            <TradeRateDetails
              isTradePriceUpdating={isTradePriceUpdating}
              rateInfoParams={rateInfoParams}
              deadline={deadlineState[0]}
            />
            <SwapWarningsTop {...swapWarningsTopProps} />
            {warnings}
            <SwapButtons {...swapButtonContext} />
            <SwapWarningsBottom {...swapWarningsBottomProps} />
          </>
        )
      },
      [
        bottomContent,
        deadlineState,
        isTradePriceUpdating,
        rateInfoParams,
        swapButtonContext,
        swapWarningsTopProps,
        swapWarningsBottomProps,
      ],
    ),
  }

  const params = {
    isEoaEthFlow,
    compactView: true,
    enableSmartSlippage: true,
    recipient,
    showRecipient: showRecipientControls,
    isTradePriceUpdating,
    priceImpact: priceImpactParams,
    disableQuotePolling: true,
    tradeQuoteStateOverride,
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
              rateInfoParams={rateInfoParams}
              trade={trade}
              allowedSlippage={slippage}
              doTrade={swapButtonContext.handleSwap}
              priceImpact={priceImpactParams}
              inputCurrencyInfo={inputCurrencyPreviewInfo}
              outputCurrencyInfo={outputCurrencyPreviewInfo}
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
