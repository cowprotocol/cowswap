import { useMemo } from 'react'

// import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
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

import { useToggleWalletModal } from 'legacy/state/application/hooks'
import { useGetQuoteAndStatus, useIsBestQuoteLoading } from 'legacy/state/price/hooks'
import { Field } from 'legacy/state/types'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useTokenSupportsPermit } from 'modules/permit'
import { getSwapButtonState } from 'modules/swap/helpers/getSwapButtonState'
import { SwapButtonsContext } from 'modules/swap/pure/SwapButtons'
import { TradeType, useTradeConfirmActions, useWrapNativeFlow } from 'modules/trade'
import { useIsNativeIn } from 'modules/trade/hooks/useIsNativeInOrOut'
import { useIsWrappedOut } from 'modules/trade/hooks/useIsWrappedInOrOut'
import { useWrappedToken } from 'modules/trade/hooks/useWrappedToken'
import { QuoteDeadlineParams } from 'modules/tradeQuote'

import { useApproveState } from 'common/hooks/useApproveState'
import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useCurrencyAmountBalanceCombined } from './useCurrencyAmountBalanceCombined'
import { useHandleSwapOrEthFlow } from './useHandleSwapOrEthFlow'
import { useDerivedSwapInfo, useSwapActionHandlers } from './useSwapState'

export interface SwapButtonInput {
  feeWarningAccepted: boolean
  impactWarningAccepted: boolean
  openNativeWrapModal(): void
}

export function useSwapButtonContext(input: SwapButtonInput): SwapButtonsContext {
  const { feeWarningAccepted, impactWarningAccepted, openNativeWrapModal } = input

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
  const { onCurrencySelection } = useSwapActionHandlers()
  const isBestQuoteLoading = useIsBestQuoteLoading()
  const tradeConfirmActions = useTradeConfirmActions()
  const { standaloneMode } = useInjectedWidgetParams()

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

  const { callback: handleSwap, contextIsReady } = useHandleSwapOrEthFlow()

  const swapCallbackError = contextIsReady ? null : 'Missing dependencies'

  const gnosisSafeInfo = useGnosisSafeInfo()
  const isReadonlyGnosisSafeUser = gnosisSafeInfo?.isReadOnly || false
  const isSwapUnsupported = useIsTradeUnsupported(currencyIn, currencyOut)
  const isSmartContractWallet = useIsSmartContractWallet()
  const isBundlingSupported = useIsBundlingSupported()
  const isPermitSupported = useTokenSupportsPermit(currencyIn, TradeType.SWAP)

  const quoteDeadlineParams: QuoteDeadlineParams = useMemo(
    () => ({
      validFor: quote?.validFor,
      quoteValidTo: quote?.quoteValidTo,
      localQuoteTimestamp: quote?.localQuoteTimestamp,
    }),
    [quote?.validFor, quote?.quoteValidTo, quote?.localQuoteTimestamp],
  )

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
    quoteDeadlineParams,
  })

  return useSafeMemo(
    () => ({
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
      widgetStandaloneMode: standaloneMode,
      quoteDeadlineParams,
    }),
    [
      swapButtonState,
      slippageAdjustedSellAmount,
      chainId,
      wrappedToken,
      handleSwap,
      hasEnoughWrappedBalanceForSwap,
      wrapCallback,
      openNativeWrapModal,
      tradeConfirmActions.onOpen,
      toggleWalletModal,
      swapInputError,
      onCurrencySelection,
      standaloneMode,
      quoteDeadlineParams,
    ],
  )
}

function useHasEnoughWrappedBalanceForSwap(inputAmount?: CurrencyAmount<Currency>): boolean {
  const { currencies } = useDerivedSwapInfo()
  const wrappedBalance = useCurrencyAmountBalanceCombined(
    currencies.INPUT ? getWrappedToken(currencies.INPUT) : undefined,
  )

  // is a native currency trade but wrapped token has enough balance
  return !!(wrappedBalance && inputAmount && !wrappedBalance.lessThan(inputAmount))
}
