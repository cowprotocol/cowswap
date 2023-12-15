import { useMemo } from 'react'

import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { currencyAmountToTokenAmount, getWrappedToken } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useIsTradeUnsupported } from '@cowprotocol/tokens'
import {
  useGnosisSafeInfo,
  useIsBundlingSupported,
  useIsSmartContractWallet,
  useWalletDetails,
  useWalletInfo,
} from '@cowprotocol/wallet'
import { Currency, CurrencyAmount, TradeType as UniTradeType } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useToggleWalletModal } from 'legacy/state/application/hooks'
import { useGetQuoteAndStatus, useIsBestQuoteLoading } from 'legacy/state/price/hooks'
import { Field } from 'legacy/state/types'
import { useExpertModeManager } from 'legacy/state/user/hooks'

import { useTokenSupportsPermit } from 'modules/permit'
import { getSwapButtonState } from 'modules/swap/helpers/getSwapButtonState'
import { useEthFlowContext } from 'modules/swap/hooks/useEthFlowContext'
import { useHandleSwap } from 'modules/swap/hooks/useHandleSwap'
import { useSafeBundleApprovalFlowContext } from 'modules/swap/hooks/useSafeBundleApprovalFlowContext'
import { useSwapConfirmManager } from 'modules/swap/hooks/useSwapConfirmManager'
import { useSwapFlowContext } from 'modules/swap/hooks/useSwapFlowContext'
import { SwapButtonsContext } from 'modules/swap/pure/SwapButtons'
import { TradeType, useWrapNativeFlow } from 'modules/trade'
import { useIsNativeIn } from 'modules/trade/hooks/useIsNativeInOrOut'
import { useIsWrappedOut } from 'modules/trade/hooks/useIsWrappedInOrOut'
import { useWrappedToken } from 'modules/trade/hooks/useWrappedToken'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'
import { useApproveState } from 'common/hooks/useApproveState'

import { useSafeBundleEthFlowContext } from './useSafeBundleEthFlowContext'
import { useDerivedSwapInfo, useSwapActionHandlers } from './useSwapState'

import { getAmountsForSignature } from '../helpers/getAmountsForSignature'

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
    allowedSlippage,
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
  const { swapZeroFee } = useFeatureFlags()

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
  const wrapUnwrapAmount = isNativeInSwap ? currencyAmountToTokenAmount(inputAmount) || undefined : inputAmount
  const hasEnoughWrappedBalanceForSwap = useHasEnoughWrappedBalanceForSwap(wrapUnwrapAmount)
  const wrapCallback = useWrapNativeFlow()
  const approvalState = useApproveState(slippageAdjustedSellAmount || null)

  const handleSwap = useHandleSwap(priceImpactParams)

  const contextExists = ethFlowContext || swapFlowContext || safeBundleApprovalFlowContext || safeBundleEthFlowContext
  const swapCallbackError = contextExists ? null : 'Missing dependencies'

  const gnosisSafeInfo = useGnosisSafeInfo()
  const isReadonlyGnosisSafeUser = gnosisSafeInfo?.isReadOnly || false
  const isSwapUnsupported = useIsTradeUnsupported(currencyIn, currencyOut)
  const isSmartContractWallet = useIsSmartContractWallet()
  const isBundlingSupported = useIsBundlingSupported()
  const isPermitSupported = useTokenSupportsPermit(currencyIn, TradeType.SWAP)

  const amountsForSignature = useMemo(() => {
    return trade
      ? getAmountsForSignature({
          trade,
          kind: trade?.tradeType === UniTradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
          allowedSlippage,
          featureFlags: { swapZeroFee },
        })
      : undefined
  }, [trade, allowedSlippage, swapZeroFee])

  const swapButtonState = getSwapButtonState({
    account,
    isSupportedWallet,
    isSmartContractWallet,
    isReadonlyGnosisSafeUser,
    isBundlingSupported,
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
    isPermitSupported,
    amountsForSignature,
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
  const wrappedBalance = useCurrencyAmountBalance(currencies.INPUT ? getWrappedToken(currencies.INPUT) : undefined)

  // is an native currency trade but wrapped token has enough balance
  return !!(wrappedBalance && inputAmount && !wrappedBalance.lessThan(inputAmount))
}
