import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from 'modules/wallet'
import { useDerivedSwapInfo, useSwapActionHandlers } from 'legacy/state/swap/hooks'
import { useExpertModeManager } from 'legacy/state/user/hooks'
import { useToggleWalletModal } from 'legacy/state/application/hooks'
import { useSwapConfirmManager } from 'modules/swap/hooks/useSwapConfirmManager'
import { Field } from 'legacy/state/swap/actions'
import {
  useHasEnoughWrappedBalanceForSwap,
  useWrapCallback,
  useWrapType,
  useWrapUnwrapError,
} from 'legacy/hooks/useWrapCallback'
import { getSwapButtonState } from 'modules/swap/helpers/getSwapButtonState'
import { SwapButtonsContext } from 'modules/swap/pure/SwapButtons'
import { useGetQuoteAndStatus, useIsBestQuoteLoading } from 'legacy/state/price/hooks'
import { useSwapFlowContext } from 'modules/swap/hooks/useSwapFlowContext'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useTradeApproveState } from 'common/containers/TradeApprove/useTradeApproveState'
import { useDetectNativeToken } from 'modules/swap/hooks/useDetectNativeToken'
import { useEthFlowContext } from 'modules/swap/hooks/useEthFlowContext'
import { useIsSmartContractWallet } from 'common/hooks/useIsSmartContractWallet'
import { useIsTradeUnsupported } from 'legacy/state/lists/hooks'
import { useHandleSwap } from 'modules/swap/hooks/useHandleSwap'
import { useIsTxBundlingEnabled } from 'common/hooks/useIsTxBundlingEnabled'
import { useSafeBundleFlowContext } from 'modules/swap/hooks/useSafeBundleFlowContext'

export interface SwapButtonInput {
  feeWarningAccepted: boolean
  impactWarningAccepted: boolean
  priceImpactParams: PriceImpact
  openNativeWrapModal(): void
}

export function useSwapButtonContext(input: SwapButtonInput): SwapButtonsContext {
  const { feeWarningAccepted, impactWarningAccepted, openNativeWrapModal, priceImpactParams } = input

  const { account, chainId } = useWalletInfo()
  const { isSupportedWallet } = useWalletDetails()
  const {
    v2Trade: trade,
    allowedSlippage,
    parsedAmount,
    currencies,
    currenciesIds,
    inputError: swapInputError,
  } = useDerivedSwapInfo()
  const [isExpertMode] = useExpertModeManager()
  const toggleWalletModal = useToggleWalletModal()
  const { openSwapConfirmModal } = useSwapConfirmManager()
  const swapFlowContext = useSwapFlowContext()
  const ethFlowContext = useEthFlowContext()
  const safeBundleContext = useSafeBundleFlowContext()
  const { onCurrencySelection } = useSwapActionHandlers()
  const isBestQuoteLoading = useIsBestQuoteLoading()

  const currencyIn = currencies[Field.INPUT]
  const currencyOut = currencies[Field.OUTPUT]

  const { quote, isGettingNewQuote } = useGetQuoteAndStatus({
    token: currenciesIds.INPUT,
    chainId,
  })

  const { isNativeIn, isWrappedOut, wrappedToken } = useDetectNativeToken()
  const isNativeInSwap = isNativeIn && !isWrappedOut

  const nativeInput = trade?.maximumAmountIn(allowedSlippage)
  const wrapUnwrapAmount = isNativeInSwap ? (nativeInput || parsedAmount)?.wrapped : nativeInput || parsedAmount
  const wrapType = useWrapType()
  const wrapInputError = useWrapUnwrapError(wrapType, wrapUnwrapAmount)
  const hasEnoughWrappedBalanceForSwap = useHasEnoughWrappedBalanceForSwap(wrapUnwrapAmount)
  const wrapCallback = useWrapCallback(wrapUnwrapAmount)
  const approvalState = useTradeApproveState(nativeInput || null)

  const handleSwap = useHandleSwap(priceImpactParams)

  const contextExists = ethFlowContext || swapFlowContext || safeBundleContext
  const swapCallbackError = contextExists ? null : 'Missing dependencies'

  const gnosisSafeInfo = useGnosisSafeInfo()
  const isReadonlyGnosisSafeUser = gnosisSafeInfo?.isReadOnly || false
  const isSwapUnsupported = useIsTradeUnsupported(currencyIn, currencyOut)
  const isSmartContractWallet = useIsSmartContractWallet()
  const isTxBundlingEnabled = useIsTxBundlingEnabled()

  const swapButtonState = getSwapButtonState({
    account,
    isSupportedWallet,
    isSmartContractWallet,
    isReadonlyGnosisSafeUser,
    isTxBundlingEnabled,
    isExpertMode,
    isSwapUnsupported,
    isNativeIn: isNativeInSwap,
    wrappedToken,
    wrapType,
    wrapInputError,
    quoteError: quote?.error,
    inputError: swapInputError,
    approvalState,
    feeWarningAccepted,
    impactWarningAccepted,
    isGettingNewQuote,
    swapCallbackError,
    trade,
    isBestQuoteLoading,
  })

  return {
    swapButtonState,
    inputAmount: nativeInput,
    chainId,
    wrappedToken,
    handleSwap,
    wrapInputError,
    wrapUnwrapAmount,
    hasEnoughWrappedBalanceForSwap,
    onWrapOrUnwrap: wrapCallback,
    onEthFlow() {
      openNativeWrapModal()
    },
    openSwapConfirm() {
      trade && openSwapConfirmModal(trade)
    },
    toggleWalletModal,
    swapInputError,
    onCurrencySelection,
  }
}
