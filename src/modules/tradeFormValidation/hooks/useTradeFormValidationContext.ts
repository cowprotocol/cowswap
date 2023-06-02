import useENSAddress from 'legacy/hooks/useENSAddress'
import { useTokenAllowance } from 'legacy/hooks/useTokenAllowance'
import { useIsTradeUnsupported } from 'legacy/state/lists/hooks'

import { isUnsupportedTokenInQuote } from 'modules/limitOrders/utils/isUnsupportedTokenInQuote'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useTradeQuote } from 'modules/tradeQuote'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from 'modules/wallet'

import { useTradeApproveState } from 'common/containers/TradeApprove'
import { useIsTxBundlingEnabled } from 'common/hooks/useIsTxBundlingEnabled'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

import { TradeFormValidationContext, TradeFormValidationLocalContext } from '../types'

export function useTradeFormValidationContext(
  localContext: TradeFormValidationLocalContext
): TradeFormValidationContext | null {
  const { account } = useWalletInfo()
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()

  const { inputCurrency, outputCurrency, slippageAdjustedSellAmount, recipient } = derivedTradeState.state || {}
  const approvalState = useTradeApproveState(slippageAdjustedSellAmount)
  const { address: recipientEnsAddress } = useENSAddress(recipient)
  const isSwapUnsupported =
    useIsTradeUnsupported(inputCurrency, outputCurrency) || isUnsupportedTokenInQuote(tradeQuote)

  const isTxBundlingEnabled = useIsTxBundlingEnabled()
  const isWrapUnwrap = useIsWrapOrUnwrap()
  const { isSupportedWallet } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const spender = useTradeSpenderAddress()

  const currentAllowance =
    useTokenAllowance(inputCurrency?.isToken ? inputCurrency : undefined, account ?? undefined, spender) || null

  const isSafeReadonlyUser = gnosisSafeInfo?.isReadOnly || false

  if (!derivedTradeState.state) return null

  return {
    ...localContext,
    account,
    isWrapUnwrap,
    isTxBundlingEnabled,
    isSupportedWallet,
    isSwapUnsupported,
    isSafeReadonlyUser,
    recipientEnsAddress,
    currentAllowance,
    derivedTradeState: derivedTradeState.state,
    approvalState,
    tradeQuote,
  }
}
