import { useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useDispatch } from 'react-redux'
import useSWR from 'swr'

import { AppDispatch } from 'legacy/state'
import { useCloseModals } from 'legacy/state/application/hooks'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useGetAmountToSignApprove } from 'modules/erc20Approve'
import { useDerivedTradeState, useGetReceiveAmountInfo, useTradeConfirmActions, useTradeTypeInfo } from 'modules/trade'
import { getIsFinalQuote, getOrderValidTo, useTradeQuote } from 'modules/tradeQuote'

import { useSolanaDelegationAllowance } from 'common/hooks/useSolanaDelegationAllowance'

import { useSolanaSigner } from './useSolanaSigner'
import { TradeFlowParams } from './useTradeFlowContext'

import { SolanaTradeFlowContext } from '../types/TradeFlowContext'
import { buildSolanaContextKey } from '../utils/buildSolanaContextKey'
import { buildSolanaTradeFlowContext } from '../utils/buildSolanaTradeFlowContext'
import { getIsSolanaTradeFlowContextReady } from '../utils/getIsSolanaTradeFlowContextReady'
import { getSolanaDelegationAmount } from '../utils/getSolanaDelegationAmount'
import { getSolanaSellToken } from '../utils/getSolanaSellToken'
import { getUiOrderType } from '../utils/getUiOrderType'

export function useSolanaTradeFlowContext({ deadline }: TradeFlowParams): SolanaTradeFlowContext | null {
  const { chainId, account } = useWalletInfo()
  const derivedTradeState = useDerivedTradeState()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const tradeTypeInfo = useTradeTypeInfo()
  const tradeQuoteState = useTradeQuote()
  const closeModals = useCloseModals()
  const dispatch = useDispatch<AppDispatch>()
  const tradeConfirmActions = useTradeConfirmActions()
  const addTransaction = useTransactionAdder()
  const solana = useSolanaSigner(account)

  const { sellAmount: inputAmount, buyAmount: outputAmount } = receiveAmountInfo?.amountsToSign ?? {}
  const { recipient, recipientAddress, orderKind, inputCurrency } = derivedTradeState || {}

  const uiOrderType = getUiOrderType(tradeTypeInfo?.tradeType)
  const sellToken = getSolanaSellToken(inputCurrency)
  // The quote reports its own sellToken as WSOL for a native sell (see `getSolanaSellToken`), so the
  // wrap step's native check must read the user's actual selection, not `inputAmount.currency`.
  const isNativeSell = Boolean(inputCurrency && getIsNativeToken(inputCurrency))
  const currentDelegation = useSolanaDelegationAllowance(sellToken?.address)
  const amountToApprove = useGetAmountToSignApprove()

  const sellAmountRaw = inputAmount ? BigInt(inputAmount.quotient.toString()) : 0n

  const validTo = getOrderValidTo(deadline, tradeQuoteState)
  const quote = tradeQuoteState.quote
  const isFinalQuote = getIsFinalQuote(tradeQuoteState.fetchParams)

  const key = useMemo(
    () =>
      buildSolanaContextKey({
        isReady: getIsSolanaTradeFlowContextReady({
          chainId,
          account,
          inputAmount,
          outputAmount,
          quote,
          isFinalQuote,
          uiOrderType,
          orderKind,
          validTo,
          hasSolanaSigner: Boolean(solana && sellToken),
        }),
        account,
        chainId,
        quote,
        inputAmount,
        outputAmount,
        uiOrderType,
        orderKind,
        validTo,
        recipient,
        recipientAddress,
        closeModals,
        dispatch,
        addTransaction,
        tradeConfirmActions,
        solana,
        sellToken,
        currentDelegation,
        delegationAmount: getSolanaDelegationAmount(amountToApprove, sellAmountRaw),
        isNativeSell,
      }),
    [
      chainId,
      account,
      inputAmount,
      outputAmount,
      quote,
      isFinalQuote,
      uiOrderType,
      orderKind,
      validTo,
      recipient,
      recipientAddress,
      closeModals,
      dispatch,
      addTransaction,
      tradeConfirmActions,
      solana,
      sellToken,
      currentDelegation,
      amountToApprove,
      sellAmountRaw,
      isNativeSell,
    ],
  )

  return useSWR(key, buildSolanaTradeFlowContext).data || null
}
