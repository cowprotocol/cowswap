import { useMemo } from 'react'

import { useENSAddress } from '@cowprotocol/ens'
import { useIsTradeUnsupported } from '@cowprotocol/tokens'
import { useGnosisSafeInfo, useIsBundlingSupported, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { isUnsupportedTokenInQuote } from 'modules/limitOrders/utils/isUnsupportedTokenInQuote'
import { useTokenSupportsPermit } from 'modules/permit'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useTradeQuote } from 'modules/tradeQuote'

import { useApproveState } from 'common/hooks/useApproveState'

import { TradeType } from '../../trade'
import { TradeFormValidationCommonContext } from '../types'

export function useTradeFormValidationContext(): TradeFormValidationCommonContext | null {
  const { account } = useWalletInfo()
  const { state: derivedTradeState } = useDerivedTradeState()
  const tradeQuote = useTradeQuote()

  const { inputCurrency, outputCurrency, slippageAdjustedSellAmount, recipient, tradeType } = derivedTradeState || {}
  const { state: approvalState } = useApproveState(slippageAdjustedSellAmount)
  const { address: recipientEnsAddress } = useENSAddress(recipient)
  const isSwapUnsupported =
    useIsTradeUnsupported(inputCurrency, outputCurrency) || isUnsupportedTokenInQuote(tradeQuote)

  const isBundlingSupported = useIsBundlingSupported()
  const isWrapUnwrap = useIsWrapOrUnwrap()
  const { isSupportedWallet } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()

  const isSafeReadonlyUser = gnosisSafeInfo?.isReadOnly === true

  const isPermitSupported = useTokenSupportsPermit(inputCurrency, tradeType)

  const isInsufficientBalanceOrderAllowed = tradeType === TradeType.LIMIT_ORDER

  const commonContext = {
    account,
    isWrapUnwrap,
    isBundlingSupported,
    isSupportedWallet,
    isSwapUnsupported,
    isSafeReadonlyUser,
    recipientEnsAddress,
    approvalState,
    tradeQuote,
    isPermitSupported,
    isInsufficientBalanceOrderAllowed,
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
