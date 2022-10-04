import { useWeb3React } from '@web3-react/core'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useDerivedSwapInfo, useDetectNativeToken, useSwapState } from 'state/swap/hooks'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useExpertModeManager } from 'state/user/hooks'
import { useCloseModals, useToggleWalletModal } from 'state/application/hooks'
import { useSwapConfirmManager } from '@cow/modules/swap/hooks/useSwapConfirmManager'
import { Field } from 'state/swap/actions'
import { TradeType } from '@uniswap/sdk-core'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { useHasEnoughWrappedBalanceForSwap, useWrapType, useWrapUnwrapError } from 'hooks/useWrapCallback'
import { useCallback } from 'react'
import { logSwapFlow } from '@cow/modules/swap/services/swapFlow/logger'
import { swapFlow } from '@cow/modules/swap/services/swapFlow'
import { useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import { useGnosisSafeInfo } from 'hooks/useGnosisSafeInfo'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { ApproveButtonsProps } from '@cow/modules/swap/containers/SwapButtons/ApproveButtons'
import { getSwapButtonState } from '@cow/modules/swap/helpers/getSwapButtonState'
import { SwapButtonsContext } from '@cow/modules/swap/containers/SwapButtons'
import { useGetQuoteAndStatus } from 'state/price/hooks'
import { OperationType } from 'components/TransactionConfirmationModal'
import { useTransactionConfirmModal } from '@cow/modules/swap/hooks/useTransactionConfirmModal'
import { useSwapFlowContext } from '@cow/modules/swap/hooks/useSwapFlowContext'
import { PriceImpact } from 'hooks/usePriceImpact'

export interface SwapButtonInput {
  feeWarningAccepted: boolean
  impactWarningAccepted: boolean
  approvalSubmitted: boolean
  priceImpactParams: PriceImpact
  setApprovalSubmitted(value: boolean): void
  openNativeWrapModal(): void
}

export function useSwapButtonContext(input: SwapButtonInput): SwapButtonsContext {
  const {
    feeWarningAccepted,
    impactWarningAccepted,
    approvalSubmitted,
    setApprovalSubmitted,
    openNativeWrapModal,
    priceImpactParams,
  } = input

  const { account, chainId } = useWeb3React()
  const { isSupportedWallet } = useWalletInfo()
  const { v2Trade: trade, allowedSlippage, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
  const transactionDeadline = useTransactionDeadline()
  const [isExpertMode] = useExpertModeManager()
  const closeModals = useCloseModals()
  const toggleWalletModal = useToggleWalletModal()
  const { openSwapConfirmModal } = useSwapConfirmManager()
  const { INPUT } = useSwapState()
  const setTransactionConfirm = useTransactionConfirmModal()
  const swapFlowContext = useSwapFlowContext()

  const currencyIn = currencies[Field.INPUT]
  const currencyOut = currencies[Field.OUTPUT]

  const { quote, isGettingNewQuote } = useGetQuoteAndStatus({
    token: INPUT.currencyId,
    chainId,
  })

  const { isNativeIn, isWrappedOut, wrappedToken } = useDetectNativeToken()
  const isNativeInSwap = isNativeIn && !isWrappedOut

  const nativeInput = !!(trade?.tradeType === TradeType.EXACT_INPUT)
    ? trade?.inputAmount
    : // else use the slippage + fee adjusted amount
      computeSlippageAdjustedAmounts(trade, allowedSlippage).INPUT
  const wrapUnwrapAmount = isNativeInSwap ? (nativeInput || parsedAmount)?.wrapped : nativeInput || parsedAmount
  const wrapType = useWrapType()
  const wrapInputError = useWrapUnwrapError(wrapType, wrapUnwrapAmount)
  const hasEnoughWrappedBalanceForSwap = useHasEnoughWrappedBalanceForSwap(wrapUnwrapAmount)

  const handleSwap = useCallback(() => {
    if (!swapFlowContext) return

    logSwapFlow('Start swap flow')
    swapFlow(swapFlowContext, priceImpactParams)
  }, [swapFlowContext, priceImpactParams])

  const swapCallbackError = swapFlowContext ? null : 'Missing dependencies'
  const isValid = !swapInputError && feeWarningAccepted && impactWarningAccepted // mod

  const { approvalState, approve: approveCallback } = useApproveCallbackFromTrade({
    openTransactionConfirmationModal(pendingText: string) {
      setTransactionConfirm({ operationType: OperationType.APPROVE_TOKEN, pendingText })
    },
    closeModals,
    trade,
    allowedSlippage,
    isNativeFlow: isNativeInSwap,
  })

  const isReadonlyGnosisSafeUser = useGnosisSafeInfo()?.isReadOnly || false
  const isSwapSupported = useIsSwapUnsupported(currencyIn, currencyOut)

  const approveButtonProps: ApproveButtonsProps = {
    trade,
    currencyIn,
    allowedSlippage,
    transactionDeadline,
    isExpertMode,
    handleSwap,
    isValid,
    approvalState,
    approveCallback,
    approvalSubmitted,
    setApprovalSubmitted,
  }

  const swapButtonState = getSwapButtonState({
    account,
    isSupportedWallet,
    isReadonlyGnosisSafeUser,
    isExpertMode,
    isSwapSupported,
    isNativeIn: isNativeInSwap,
    wrappedToken,
    wrapType,
    wrapInputError,
    quoteError: quote?.error,
    inputError: swapInputError,
    approvalState,
    approvalSubmitted,
    feeWarningAccepted,
    impactWarningAccepted,
    isGettingNewQuote,
    swapCallbackError,
    trade,
  })

  return {
    swapButtonState,
    approveButtonProps,
    chainId,
    wrappedToken,
    handleSwap,
    wrapInputError,
    wrapUnwrapAmount,
    hasEnoughWrappedBalanceForSwap,
    onWrap() {
      openNativeWrapModal()
    },
    openSwapConfirm() {
      trade && openSwapConfirmModal(trade)
    },
    toggleWalletModal,
    swapInputError,
  }
}
