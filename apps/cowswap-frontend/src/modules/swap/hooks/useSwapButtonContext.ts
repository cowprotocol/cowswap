import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { currencyAmountToTokenAmount, getWrappedToken } from '@cowprotocol/common-utils'
import { useIsTradeUnsupported } from '@cowprotocol/tokens'
import {
  useGnosisSafeInfo,
  useIsBundlingSupported,
  useIsSmartContractWallet,
  useWalletDetails,
  useWalletInfo,
} from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useToggleWalletModal } from 'legacy/state/application/hooks'
import { useGetQuoteAndStatus, useIsBestQuoteLoading } from 'legacy/state/price/hooks'
import { Field } from 'legacy/state/types'

import { useTokenSupportsPermit } from 'modules/permit'
import { getSwapButtonState } from 'modules/swap/helpers/getSwapButtonState'
import { useEthFlowContext } from 'modules/swap/hooks/useEthFlowContext'
import { useHandleSwap } from 'modules/swap/hooks/useHandleSwap'
import { useImFeelingLucky } from 'modules/swap/hooks/useImFeelingLucky'
import { useSafeBundleApprovalFlowContext } from 'modules/swap/hooks/useSafeBundleApprovalFlowContext'
import { useSwapFlowContext } from 'modules/swap/hooks/useSwapFlowContext'
import { SwapButtonsContext } from 'modules/swap/pure/SwapButtons'
import { TradeType, useTradeConfirmActions, useWrapNativeFlow } from 'modules/trade'
import { useIsNativeIn } from 'modules/trade/hooks/useIsNativeInOrOut'
import { useIsWrappedOut } from 'modules/trade/hooks/useIsWrappedInOrOut'
import { useWrappedToken } from 'modules/trade/hooks/useWrappedToken'

import { useIsAprilFoolsEnabled } from 'common/hooks/featureFlags/useIsAprilFoolsEnabled'
import { useApproveState } from 'common/hooks/useApproveState'

import { useSafeBundleEthFlowContext } from './useSafeBundleEthFlowContext'
import { useDerivedSwapInfo, useSwapActionHandlers } from './useSwapState'

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
    trade,
    parsedAmount,
    currencies,
    currenciesIds,
    inputError: swapInputError,
  } = useDerivedSwapInfo()
  const toggleWalletModal = useToggleWalletModal()
  const swapFlowContext = useSwapFlowContext()
  const ethFlowContext = useEthFlowContext()
  const safeBundleApprovalFlowContext = useSafeBundleApprovalFlowContext()
  const safeBundleEthFlowContext = useSafeBundleEthFlowContext()
  const { onCurrencySelection } = useSwapActionHandlers()
  const isBestQuoteLoading = useIsBestQuoteLoading()
  const tradeConfirmActions = useTradeConfirmActions()

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
  const wrapUnwrapAmount = isNativeInSwap && inputAmount ? currencyAmountToTokenAmount(inputAmount) : inputAmount
  const hasEnoughWrappedBalanceForSwap = useHasEnoughWrappedBalanceForSwap(wrapUnwrapAmount)
  const wrapCallback = useWrapNativeFlow()
  const { state: approvalState } = useApproveState(slippageAdjustedSellAmount || null)

  const handleSwap = useHandleSwap(priceImpactParams)

  const contextExists = ethFlowContext || swapFlowContext || safeBundleApprovalFlowContext || safeBundleEthFlowContext
  const recipientAddressOrName = contextExists?.orderParams.recipientAddressOrName || null

  const swapCallbackError = contextExists ? null : 'Missing dependencies'

  const imFeelingLucky = useImFeelingLucky()

  const gnosisSafeInfo = useGnosisSafeInfo()
  const isReadonlyGnosisSafeUser = gnosisSafeInfo?.isReadOnly || false
  const isSwapUnsupported = useIsTradeUnsupported(currencyIn, currencyOut)
  const isSmartContractWallet = useIsSmartContractWallet()
  const isBundlingSupported = useIsBundlingSupported()
  const isPermitSupported = useTokenSupportsPermit(currencyIn, TradeType.SWAP)
  const isAprilFoolsEnabled = useIsAprilFoolsEnabled()
  const hasSellToken = !!currencyIn

  const swapButtonState = getSwapButtonState({
    account,
    isSupportedWallet,
    isSmartContractWallet,
    isReadonlyGnosisSafeUser,
    isBundlingSupported,
    isSwapUnsupported,
    isNativeIn: isNativeInSwap,
    wrappedToken,
    quote,
    quoteError: quote?.error,
    inputError: swapInputError,
    approvalState,
    feeWarningAccepted,
    impactWarningAccepted,
    isGettingNewQuote,
    swapCallbackError,
    trade,
    isBestQuoteLoading,
    isPermitSupported,
    isAprilFoolsEnabled,
    hasSellToken,
  })

  return {
    swapButtonState,
    inputAmount: slippageAdjustedSellAmount || undefined,
    chainId,
    wrappedToken,
    handleSwap,
    hasEnoughWrappedBalanceForSwap,
    onWrapOrUnwrap: wrapCallback,
    onEthFlow: openNativeWrapModal,
    openSwapConfirm: tradeConfirmActions.onOpen,
    toggleWalletModal,
    swapInputError,
    onCurrencySelection,
    recipientAddressOrName,
    imFeelingLucky,
  }
}

function useHasEnoughWrappedBalanceForSwap(inputAmount?: CurrencyAmount<Currency>): boolean {
  const { currencies } = useDerivedSwapInfo()
  const wrappedBalance = useCurrencyAmountBalance(currencies.INPUT ? getWrappedToken(currencies.INPUT) : undefined)

  // is a native currency trade but wrapped token has enough balance
  return !!(wrappedBalance && inputAmount && !wrappedBalance.lessThan(inputAmount))
}
