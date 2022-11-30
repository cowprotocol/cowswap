import * as styledEl from './styled'
import { useWeb3React } from '@web3-react/core'
import { useSwapState } from 'state/swap/hooks'
import {
  useDerivedSwapInfo,
  useHighFeeWarning,
  useIsFeeGreaterThanInput,
  useSwapActionHandlers,
  useUnknownImpactWarning,
} from 'state/swap/hooks'
import { useWrapType, WrapType } from 'hooks/useWrapCallback'
import { useSwapCurrenciesAmounts } from '@cow/modules/swap/hooks/useSwapCurrenciesAmounts'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useExpertModeManager, useUserSlippageTolerance } from 'state/user/hooks'
import useCowBalanceAndSubsidy from 'hooks/useCowBalanceAndSubsidy'
import { useShowRecipientControls } from '@cow/modules/swap/hooks/useShowRecipientControls'
import usePriceImpact from 'hooks/usePriceImpact'
import { useTradePricesUpdate } from '@cow/modules/swap/hooks/useTradePricesUpdate'
import { useCurrencyBalance } from 'state/connection/hooks'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { Field } from 'state/swap/actions'
import { tokenViewAmount } from '@cow/modules/swap/helpers/tokenViewAmount'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from '@cow/modules/swap/helpers/tradeReceiveAmount'
import React, { useState } from 'react'
import { useModalIsOpen } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useSwapButtonContext } from '@cow/modules/swap/hooks/useSwapButtonContext'
import { SwapFormProps } from '@cow/modules/swap/containers/NewSwapWidget/types'
import { ConfirmSwapModalSetupProps } from '@cow/modules/swap/containers/ConfirmSwapModalSetup'
import { EthFlowProps } from '@cow/modules/swap/containers/EthFlow'
import { NewSwapModals, NewSwapModalsProps } from '@cow/modules/swap/containers/NewSwapModals'
import {
  NewSwapWarningsBottom,
  NewSwapWarningsBottomProps,
  NewSwapWarningsTop,
  NewSwapWarningsTopProps,
} from '@cow/modules/swap/pure/warnings'
import { TradeRates, TradeRatesProps } from '@cow/modules/swap/pure/TradeRates'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import { SwapForm } from '@cow/modules/swap/pure/SwapForm'
import { SwapButtons } from '@cow/modules/swap/pure/SwapButtons'
import { useSetupTradeState } from '@cow/modules/trade'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import { useRateInfoParams } from '@cow/common/hooks/useRateInfoParams'

export function NewSwapWidget() {
  useSetupTradeState()

  const { chainId, account } = useWeb3React()
  const { allowedSlippage, currencies, currenciesIds, v2Trade: trade } = useDerivedSwapInfo()
  const wrapType = useWrapType()
  const parsedAmounts = useSwapCurrenciesAmounts(wrapType)
  const { isSupportedWallet, allowsOffchainSigning } = useWalletInfo()
  const isSwapUnsupported = useIsSwapUnsupported(currencies.INPUT, currencies.OUTPUT)
  const [isExpertMode] = useExpertModeManager()
  const swapActions = useSwapActionHandlers()
  const subsidyAndBalance = useCowBalanceAndSubsidy()
  const userAllowedSlippage = useUserSlippageTolerance()
  const swapState = useSwapState()
  const { independentField, recipient } = swapState
  const showRecipientControls = useShowRecipientControls(recipient)

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

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: currencies.INPUT || null,
    rawAmount: parsedAmounts.INPUT || null,
    viewAmount: tokenViewAmount(parsedAmounts.INPUT, inputCurrencyBalance, independentField === Field.INPUT),
    balance: inputCurrencyBalance,
    fiatAmount: useHigherUSDValue(trade?.inputAmountWithoutFee),
    receiveAmountInfo: independentField === Field.OUTPUT && trade ? getInputReceiveAmountInfo(trade) : null,
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: currencies.OUTPUT || null,
    rawAmount: parsedAmounts.OUTPUT || null,
    viewAmount: tokenViewAmount(parsedAmounts.OUTPUT, outputCurrencyBalance, independentField === Field.OUTPUT),
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

  const swapFormProps: SwapFormProps = {
    chainId,
    recipient,
    allowedSlippage,
    isTradePriceUpdating,
    inputCurrencyInfo,
    outputCurrencyInfo,
    priceImpactParams,
    swapActions,
    subsidyAndBalance,
    allowsOffchainSigning,
    showRecipientControls,
  }

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.rawAmount, outputCurrencyInfo.rawAmount)

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

  const swapModalsProps: NewSwapModalsProps = {
    chainId,
    showNativeWrapModal,
    showCowSubsidyModal,
    confirmSwapProps,
    ethFlowProps,
  }

  const swapWarningsTopProps: NewSwapWarningsTopProps = {
    trade,
    account,
    feeWarningAccepted,
    impactWarningAccepted,
    // don't show the unknown impact warning on: no trade, wrapping native, no error, or it's loading impact
    hideUnknownImpactWarning: !trade || isWrapUnwrapMode || !priceImpactParams.error || priceImpactParams.loading,
    isExpertMode,
    setFeeWarningAccepted,
    setImpactWarningAccepted,
  }

  const swapWarningsBottomProps: NewSwapWarningsBottomProps = {
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

  return (
    <>
      <styledEl.Container id="new-swap-widget">
        <NewSwapModals {...swapModalsProps} />
        <AffiliateStatusCheck />
        <styledEl.ContainerBox id="swap-page">
          <SwapForm {...swapFormProps} />
          {showTradeRates && <TradeRates {...tradeRatesProps} />}
          <NewSwapWarningsTop {...swapWarningsTopProps} />
          <SwapButtons {...swapButtonContext} />
          <NewSwapWarningsBottom {...swapWarningsBottomProps} />
        </styledEl.ContainerBox>
        <NetworkAlert />
      </styledEl.Container>
    </>
  )
}
