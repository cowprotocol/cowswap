import { useMemo } from 'react'

import { useIsOnline } from '@cowprotocol/common-hooks'
import { useENSAddress } from '@cowprotocol/ens'
import { useIsTradeUnsupported } from '@cowprotocol/tokens'
import { useGnosisSafeInfo, useIsTxBundlingSupported, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { TradeType, useDerivedTradeState, useIsWrapOrUnwrap } from 'modules/trade'
import { TradeQuoteState, useTradeQuote } from 'modules/tradeQuote'

import { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { useIsApprovalRequired } from 'modules/erc20Approval'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { TradeFormValidationCommonContext } from '../types'

export function useTradeFormValidationContext(): TradeFormValidationCommonContext | null {
  const { account } = useWalletInfo()
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isOnline = useIsOnline()

  const { inputCurrency, outputCurrency, recipient, tradeType } = derivedTradeState || {}
  const { address: recipientEnsAddress } = useENSAddress(recipient)
  const isSwapUnsupported =
    useIsTradeUnsupported(inputCurrency, outputCurrency) || isUnsupportedTokenInQuote(tradeQuote)

  const isBundlingSupported = useIsTxBundlingSupported()
  const isWrapUnwrap = useIsWrapOrUnwrap()
  const { isSupportedWallet } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()

  const isSafeReadonlyUser = gnosisSafeInfo?.isReadOnly === true

  const isApprovalRequired = useIsApprovalRequired()

  const isInsufficientBalanceOrderAllowed = tradeType === TradeType.LIMIT_ORDER

  const commonContext = {
    account,
    isWrapUnwrap,
    isBundlingSupported: !!isBundlingSupported,
    isSupportedWallet,
    isSwapUnsupported,
    isSafeReadonlyUser,
    recipientEnsAddress,
    tradeQuote,
    isApprovalRequired,
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
