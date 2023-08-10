import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useToggleWalletModal } from 'legacy/state/application/hooks'
import { useIsTradeUnsupported } from 'legacy/state/lists/hooks'
import { useGetQuoteAndStatus, useIsBestQuoteLoading } from 'legacy/state/price/hooks'
import { Field } from 'legacy/state/swap/actions'
import { useDerivedSwapInfo, useSwapActionHandlers } from 'legacy/state/swap/hooks'
import { useExpertModeManager } from 'legacy/state/user/hooks'

import { getSwapButtonState } from 'modules/swap/helpers/getSwapButtonState'
import { useEthFlowContext } from 'modules/swap/hooks/useEthFlowContext'
import { useHandleSwap } from 'modules/swap/hooks/useHandleSwap'
import { useSafeBundleApprovalFlowContext } from 'modules/swap/hooks/useSafeBundleApprovalFlowContext'
import { useSwapConfirmManager } from 'modules/swap/hooks/useSwapConfirmManager'
import { useSwapFlowContext } from 'modules/swap/hooks/useSwapFlowContext'
import { SwapButtonsContext } from 'modules/swap/pure/SwapButtons'
import useCurrencyBalance from 'modules/tokens/hooks/useCurrencyBalance'
import { useWrapNativeFlow } from 'modules/trade'
import { useIsNativeIn } from 'modules/trade/hooks/useIsNativeInOrOut'
import { useIsWrappedOut } from 'modules/trade/hooks/useIsWrappedInOrOut'
import { useWrappedToken } from 'modules/trade/hooks/useWrappedToken'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from 'modules/wallet'

import { useTradeApproveState } from 'common/containers/TradeApprove/useTradeApproveState'
import { useIsEthFlowBundlingEnabled } from 'common/hooks/featureFlags/useIsEthFlowBundlingEnabled'
import { useIsTxBundlingEnabled } from 'common/hooks/featureFlags/useIsTxBundlingEnabled'
import { useIsSmartContractWallet } from 'common/hooks/useIsSmartContractWallet'

import { useSafeBundleEthFlowContext } from './useSafeBundleEthFlowContext'

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
    slippageAdjustedSellAmount,
    v2Trade: trade,
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
  const safeBundleApprovalFlowContext = useSafeBundleApprovalFlowContext()
  const safeBundleEthFlowContext = useSafeBundleEthFlowContext()
  const { onCurrencySelection } = useSwapActionHandlers()
  const isBestQuoteLoading = useIsBestQuoteLoading()

  const currencyIn = currencies[Field.INPUT]
  const currencyOut = currencies[Field.OUTPUT]

  const { quote, isGettingNewQuote } = useGetQuoteAndStatus({
    token: currenciesIds.INPUT,
    chainId,
  })

  const isNativeIn = useIsNativeIn()
  const isWrappedOut = useIsWrappedOut()
  const wrappedToken = useWrappedToken()
  const isNativeInSwap = isNativeIn && !isWrappedOut

  const inputAmount = slippageAdjustedSellAmount || parsedAmount
  const wrapUnwrapAmount = isNativeInSwap ? inputAmount?.wrapped : inputAmount
  const hasEnoughWrappedBalanceForSwap = useHasEnoughWrappedBalanceForSwap(wrapUnwrapAmount)
  const wrapCallback = useWrapNativeFlow()
  const approvalState = useTradeApproveState(slippageAdjustedSellAmount || null)

  const handleSwap = useHandleSwap(priceImpactParams)

  const contextExists = ethFlowContext || swapFlowContext || safeBundleApprovalFlowContext || safeBundleEthFlowContext
  const swapCallbackError = contextExists ? null : 'Missing dependencies'

  const gnosisSafeInfo = useGnosisSafeInfo()
  const isReadonlyGnosisSafeUser = gnosisSafeInfo?.isReadOnly || false
  const isSwapUnsupported = useIsTradeUnsupported(currencyIn, currencyOut)
  const isSmartContractWallet = useIsSmartContractWallet()
  const isTxBundlingEnabled = useIsTxBundlingEnabled()
  const isEthFlowBundlingEnabled = useIsEthFlowBundlingEnabled()

  const swapButtonState = getSwapButtonState({
    account,
    isSupportedWallet,
    isSmartContractWallet,
    isReadonlyGnosisSafeUser,
    isTxBundlingEnabled,
    isEthFlowBundlingEnabled,
    isExpertMode,
    isSwapUnsupported,
    isNativeIn: isNativeInSwap,
    wrappedToken,
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
    inputAmount: slippageAdjustedSellAmount || undefined,
    chainId,
    wrappedToken,
    handleSwap,
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

function useHasEnoughWrappedBalanceForSwap(inputAmount?: CurrencyAmount<Currency>): boolean {
  const { currencies } = useDerivedSwapInfo()
  const { account } = useWalletInfo()
  const wrappedBalance = useCurrencyBalance(account ?? undefined, currencies.INPUT?.wrapped)

  // is an native currency trade but wrapped token has enough balance
  return !!(wrappedBalance && inputAmount && !wrappedBalance.lessThan(inputAmount))
}
