import { useMemo } from 'react'

import { LAUNCH_DARKLY_VIEM_MIGRATION } from '@cowprotocol/common-const'
import { useWalletDetails } from '@cowprotocol/wallet'

import { useAppKit } from '@reown/appkit/react'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { useGetAmountToSignApprove } from 'modules/erc20Approve'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useAmountsToSignFromQuote, useDerivedTradeState, useWrapNativeFlow } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useTokenCustomTradeError } from './useTokenCustomTradeError'

import { TradeFormButtonContext } from '../types'

export function useTradeFormButtonContext(
  defaultText: string,
  confirmTrade: () => void,
  supportsPartialApprove = false,
): TradeFormButtonContext | null {
  const { open } = useAppKit()
  const wrapNativeFlow = useWrapNativeFlow()
  const { isSupportedWallet } = useWalletDetails()
  const quote = useTradeQuote()
  const toggleWalletModal = useToggleWalletModal()
  const { standaloneMode } = useInjectedWidgetParams()
  const derivedState = useDerivedTradeState()
  const amountToApprove = useGetAmountToSignApprove()
  const { maximumSendSellAmount: minAmountToSignForSwap } = useAmountsToSignFromQuote() || {}
  const customTokenError = useTokenCustomTradeError(
    derivedState?.inputCurrency,
    derivedState?.outputCurrency,
    quote.error,
  )
  const { error: balancesError } = useTokensBalancesCombined()

  return useMemo(() => {
    if (!derivedState) return null

    return {
      defaultText,
      amountToApprove,
      derivedState,
      quote,
      isSupportedWallet,
      confirmTrade,
      wrapNativeFlow,
      connectWallet: LAUNCH_DARKLY_VIEM_MIGRATION ? () => open() : toggleWalletModal,
      widgetStandaloneMode: standaloneMode,
      supportsPartialApprove,
      customTokenError,
      minAmountToSignForSwap,
      balancesError,
    } satisfies TradeFormButtonContext
  }, [
    defaultText,
    amountToApprove,
    derivedState,
    quote,
    isSupportedWallet,
    confirmTrade,
    wrapNativeFlow,
    open,
    toggleWalletModal,
    standaloneMode,
    supportsPartialApprove,
    customTokenError,
    minAmountToSignForSwap,
    balancesError,
  ])
}
