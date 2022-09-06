import React, { useState } from 'react'
import * as styledEl from './styled'
import {
  useDerivedSwapInfo,
  useHighFeeWarning,
  useSwapActionHandlers,
  useSwapState,
  useUnknownImpactWarning,
} from 'state/swap/hooks'
import { Field } from 'state/swap/actions'
import { useSetupSwapState } from 'pages/NewSwap/hooks/useSetupSwapState'
import { useCurrencyBalance } from '@src/state/connection/hooks'
import { useWeb3React } from '@web3-react/core'
import { CurrencyInfo, SwapFormProps } from 'pages/NewSwap/typings'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { useGetQuoteAndStatus } from 'state/price/hooks'
import { useSwapCurrenciesAmounts } from 'pages/NewSwap/hooks/useSwapCurrenciesAmounts'
import usePriceImpact from 'hooks/usePriceImpact'
import { formatSmartAmount } from 'utils/format'
import { useWrapType, WrapType } from 'hooks/useWrapCallback'
import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from 'pages/NewSwap/helpers/tradeReceiveAmount'
import { useSwapFlowContext } from 'pages/Swap/swapFlow/useSwapFlowContext'
import { SwapButton } from 'pages/Swap/components/SwapButton/SwapButton'
import { useSwapButtonContext } from 'pages/Swap/hooks/useSwapButtonContext'
import { useModalIsOpen } from 'state/application/hooks'
import { ApplicationModal } from '@src/state/application/reducer'
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
import { useExpertModeManager } from '@src/state/user/hooks'
import useCowBalanceAndSubsidy from 'hooks/useCowBalanceAndSubsidy'
import { SwapForm } from 'pages/NewSwap/components/SwapForm'
import { useShowRecipientControls } from 'pages/NewSwap/hooks/useShowRecipientControls'

export function NewSwapPage() {
  useSetupSwapState()

  const { chainId, account } = useWeb3React()
  const { INPUT, independentField, recipient } = useSwapState()
  const { allowedSlippage, currencies, v2Trade: trade } = useDerivedSwapInfo()
  const wrapType = useWrapType()
  const parsedAmounts = useSwapCurrenciesAmounts(wrapType)
  const swapFlowContext = useSwapFlowContext()
  const { isSupportedWallet, allowsOffchainSigning } = useWalletInfo()
  const swapIsUnsupported = useIsSwapUnsupported(currencies.INPUT, currencies.OUTPUT)
  const [isExpertMode] = useExpertModeManager()
  const swapActions = useSwapActionHandlers()
  const subsidyAndBalance = useCowBalanceAndSubsidy()
  const showRecipientControls = useShowRecipientControls()

  const isWrapUnwrapMode = wrapType !== WrapType.NOT_APPLICABLE
  const priceImpactParams = usePriceImpact({
    abTrade: trade,
    parsedAmounts,
    isWrapping: isWrapUnwrapMode,
  })

  const { isGettingNewQuote } = useGetQuoteAndStatus({
    token: currencies.INPUT?.isNative ? currencies.INPUT.wrapped.address : INPUT.currencyId,
    chainId,
  })

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: currencies.INPUT || null,
    viewAmount: formatSmartAmount(parsedAmounts.INPUT) || '',
    balance: useCurrencyBalance(account ?? undefined, currencies.INPUT) || null,
    fiatAmount: useHigherUSDValue(trade?.inputAmountWithoutFee),
    receiveAmountInfo: independentField === Field.OUTPUT && trade ? getInputReceiveAmountInfo(trade) : null,
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: currencies.OUTPUT || null,
    viewAmount: formatSmartAmount(parsedAmounts.OUTPUT) || '',
    balance: useCurrencyBalance(account ?? undefined, currencies.OUTPUT) || null,
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
    swapFlowContext,
    feeWarningAccepted,
    impactWarningAccepted,
    approvalSubmitted,
    setApprovalSubmitted,
    openNativeWrapModal,
  })

  const swapFormProps: SwapFormProps = {
    recipient,
    allowedSlippage,
    isGettingNewQuote,
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
    wrapUnrapAmount: swapButtonContext.wrapUnrapAmount,
    approvalState: swapButtonContext.approveButtonProps.approvalState,
    onDismiss: dismissNativeWrapModal,
    approveCallback: swapButtonContext.approveButtonProps.approveCallback,
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
    swapIsUnsupported,
    currencyIn: currencies.INPUT || undefined,
    currencyOut: currencies.OUTPUT || undefined,
  }

  return (
    <>
      <styledEl.Container>
        <styledEl.ContainerBox>
          <NewSwapModals {...swapModalsProps} />
          <AffiliateStatusCheck />
          <SwapForm {...swapFormProps} />
          <NewSwapWarningsTop {...swapWarningsTopProps} />
          <SwapButton {...swapButtonContext} />
        </styledEl.ContainerBox>
        <NewSwapWarningsBottom {...swapWarningsBottomProps} />
      </styledEl.Container>
    </>
  )
}
