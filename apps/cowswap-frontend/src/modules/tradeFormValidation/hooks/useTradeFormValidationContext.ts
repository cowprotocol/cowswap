import { useMemo } from 'react'

import { useENSAddress } from '@cowprotocol/ens'
import { useIsTradeUnsupported } from '@cowprotocol/tokens'
import { useGnosisSafeInfo, useIsTxBundlingSupported, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useTokenSupportsPermit } from 'modules/permit'
import { TradeType, useDerivedTradeState, useIsWrapOrUnwrap, useReceiveAmounts } from 'modules/trade'
import { TradeQuoteState, useTradeQuote } from 'modules/tradeQuote'

import { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { useApproveState } from 'common/hooks/useApproveState'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { TradeFormValidationCommonContext } from '../types'
import { useIsOnline } from '@cowprotocol/common-hooks'

export function useTradeFormValidationContext(): TradeFormValidationCommonContext | null {
  const { account } = useWalletInfo()
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isOnline = useIsOnline()

  const { inputCurrency, outputCurrency, recipient, tradeType } = derivedTradeState || {}
  const receiveAmounts = useReceiveAmounts()
  const { state: approvalState } = useApproveState(receiveAmounts?.maximumSendSellAmount)
  const { address: recipientEnsAddress } = useENSAddress(recipient)
  const isSwapUnsupported =
    useIsTradeUnsupported(inputCurrency, outputCurrency) || isUnsupportedTokenInQuote(tradeQuote)

  const isBundlingSupported = useIsTxBundlingSupported()
  const isWrapUnwrap = useIsWrapOrUnwrap()
  const { isSupportedWallet } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()

  const isSafeReadonlyUser = gnosisSafeInfo?.isReadOnly === true

  const isPermitSupported = useTokenSupportsPermit(inputCurrency, tradeType)

  const isInsufficientBalanceOrderAllowed = tradeType === TradeType.LIMIT_ORDER

  const commonContext = {
    account,
    isWrapUnwrap,
    isBundlingSupported: !!isBundlingSupported,
    isSupportedWallet,
    isSwapUnsupported,
    isSafeReadonlyUser,
    recipientEnsAddress,
    approvalState,
    tradeQuote,
    isPermitSupported,
    isInsufficientBalanceOrderAllowed,
    isProviderNetworkUnsupported,
    isOnline,
    derivedTradeState,
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

function isUnsupportedTokenInQuote(state: TradeQuoteState): boolean {
  return state.error?.type === QuoteApiErrorCodes.UnsupportedToken
}
