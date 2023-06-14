import { useMemo } from 'react'

import useENSAddress from 'legacy/hooks/useENSAddress'
import { useIsTradeUnsupported } from 'legacy/state/lists/hooks'

import { isUnsupportedTokenInQuote } from 'modules/limitOrders/utils/isUnsupportedTokenInQuote'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useTradeQuote } from 'modules/tradeQuote'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from 'modules/wallet'

import { useTradeApproveState } from 'common/containers/TradeApprove'
import { useIsTxBundlingEnabled } from 'common/hooks/featureFlags/useIsTxBundlingEnabled'

import { TradeFormValidationCommonContext } from '../types'

export function useTradeFormValidationContext(): TradeFormValidationCommonContext | null {
  const { account } = useWalletInfo()
  const { state: derivedTradeState } = useDerivedTradeState()
  const tradeQuote = useTradeQuote()

  const { inputCurrency, outputCurrency, slippageAdjustedSellAmount, recipient } = derivedTradeState || {}
  const approvalState = useTradeApproveState(slippageAdjustedSellAmount)
  const { address: recipientEnsAddress } = useENSAddress(recipient)
  const isSwapUnsupported =
    useIsTradeUnsupported(inputCurrency, outputCurrency) || isUnsupportedTokenInQuote(tradeQuote)

  const isTxBundlingEnabled = useIsTxBundlingEnabled()
  const isWrapUnwrap = useIsWrapOrUnwrap()
  const { isSupportedWallet } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()

  const isSafeReadonlyUser = gnosisSafeInfo?.isReadOnly || false

  const commonContext = {
    account,
    isWrapUnwrap,
    isTxBundlingEnabled,
    isSupportedWallet,
    isSwapUnsupported,
    isSafeReadonlyUser,
    recipientEnsAddress,
    approvalState,
    tradeQuote,
  }

  return useMemo(() => {
    if (!derivedTradeState) return null

    return {
      ...commonContext,
      derivedTradeState,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...Object.values(commonContext), derivedTradeState])
}
