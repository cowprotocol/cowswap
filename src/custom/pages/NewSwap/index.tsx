import React, { useState } from 'react'
import * as styledEl from './styled'
import {
  useDerivedSwapInfo,
  useHighFeeWarning,
  useIsFeeGreaterThanInput,
  useSwapActionHandlers,
  useSwapState,
  useUnknownImpactWarning,
} from 'state/swap/hooks'
import { Field } from 'state/swap/actions'
import { useSetupSwapState } from 'pages/NewSwap/hooks/useSetupSwapState'
import { useCurrencyBalance } from 'state/connection/hooks'
import { useWeb3React } from '@web3-react/core'
import { CurrencyInfo, SwapFormProps } from 'pages/NewSwap/typings'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { useSwapCurrenciesAmounts } from 'pages/NewSwap/hooks/useSwapCurrenciesAmounts'
import usePriceImpact from 'hooks/usePriceImpact'
import { useWrapType, WrapType } from 'hooks/useWrapCallback'
import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from 'pages/NewSwap/helpers/tradeReceiveAmount'
import { SwapButton } from 'pages/Swap/components/SwapButton/SwapButton'
import { useSwapButtonContext } from 'pages/Swap/hooks/useSwapButtonContext'
import { useModalIsOpen } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { NewSwapModals, NewSwapModalsProps } from 'pages/NewSwap/modals'
import { ConfirmSwapModalSetupProps } from 'pages/Swap/components/ConfirmSwapModalSetup'
import { EthFlowProps } from 'components/swap/EthFlow'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import {
  NewSwapWarningsBottom,
  NewSwapWarningsBottomProps,
  NewSwapWarningsTop,
  NewSwapWarningsTopProps,
} from 'pages/NewSwap/warnings'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useExpertModeManager, useUserSlippageTolerance } from 'state/user/hooks'
import useCowBalanceAndSubsidy from 'hooks/useCowBalanceAndSubsidy'
import { SwapForm } from 'pages/NewSwap/pureComponents/SwapForm'
import { useShowRecipientControls } from 'pages/NewSwap/hooks/useShowRecipientControls'
import { TradeRates, TradeRatesProps } from 'pages/NewSwap/pureComponents/TradeRates'
import { useTradePricesUpdate } from 'pages/NewSwap/hooks/useTradePricesUpdate'
import { tokenViewAmount } from 'pages/NewSwap/helpers/tokenViewAmount'

export function NewSwapPage() {
  useSetupSwapState()

  const { chainId, account } = useWeb3React()
  const { INPUT, independentField, recipient } = useSwapState()
  const { allowedSlippage, currencies, v2Trade: trade } = useDerivedSwapInfo()
  const wrapType = useWrapType()
  const parsedAmounts = useSwapCurrenciesAmounts(wrapType)
  const { isSupportedWallet, allowsOffchainSigning } = useWalletInfo()
  const isSwapUnsupported = useIsSwapUnsupported(currencies.INPUT, currencies.OUTPUT)
  const [isExpertMode] = useExpertModeManager()
  const swapActions = useSwapActionHandlers()
  const subsidyAndBalance = useCowBalanceAndSubsidy()
  const showRecipientControls = useShowRecipientControls()
  const userAllowedSlippage = useUserSlippageTolerance()

  const isWrapUnwrapMode = wrapType !== WrapType.NOT_APPLICABLE
  const priceImpactParams = usePriceImpact({
    abTrade: trade,
    parsedAmounts,
    isWrapping: isWrapUnwrapMode,
  })

  const isTradePriceUpdating = useTradePricesUpdate()
  const { isFeeGreater, fee } = useIsFeeGreaterThanInput({
    chainId,
    address: INPUT.currencyId,
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

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
  const [showNativeWrapModal, setOpenNativeWrapModal] = useState(false)
  const showCowSubsidyModal = useModalIsOpen(ApplicationModal.COW_SUBSIDY)

  const { feeWarningAccepted, setFeeWarningAccepted } = useHighFeeWarning(trade)
  const { impactWarningAccepted, setImpactWarningAccepted } = useUnknownImpactWarning(priceImpactParams)

  const openNativeWrapModal = () => setOpenNativeWrapModal(true)
  const dismissNativeWrapModal = () => setOpenNativeWrapModal(false)

  const swapButtonContext = useSwapButtonContext({
    feeWarningAccepted,
    impactWarningAccepted,
    approvalSubmitted,
    setApprovalSubmitted,
    openNativeWrapModal,
    priceImpactParams,
  })

  const swapFormProps: SwapFormProps = {
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

  const confirmSwapProps: ConfirmSwapModalSetupProps = {
    trade,
    recipient,
    allowedSlippage,
    handleSwap: swapButtonContext.handleSwap,
    priceImpact: priceImpactParams.priceImpact,
    dismissNativeWrapModal,
  }

  const ethFlowProps: EthFlowProps = {
    nativeInput: parsedAmounts.INPUT,
    wrapUnwrapAmount: swapButtonContext.wrapUnwrapAmount,
    approvalState: swapButtonContext.approveButtonProps.approvalState,
    onDismiss: dismissNativeWrapModal,
    approveCallback: swapButtonContext.approveButtonProps.approveCallback,
    handleSwapCallback: swapButtonContext.handleSwap,
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
  }

  return (
    <>
      <styledEl.Container>
        <NewSwapModals {...swapModalsProps} />
        <AffiliateStatusCheck />
        <styledEl.ContainerBox>
          <SwapForm {...swapFormProps} />
          <TradeRates {...tradeRatesProps} />
          <NewSwapWarningsTop {...swapWarningsTopProps} />
          <SwapButton {...swapButtonContext} />
        </styledEl.ContainerBox>
        <NewSwapWarningsBottom {...swapWarningsBottomProps} />
      </styledEl.Container>
    </>
  )
}
