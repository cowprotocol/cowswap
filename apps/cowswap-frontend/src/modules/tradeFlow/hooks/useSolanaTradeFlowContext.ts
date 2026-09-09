import { useMemo } from 'react'

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

// Mirrors swapFlow's `orderParams.recipient = recipientAddress || recipient || account`: prefer the
// resolved recipient address, then the raw recipient value, then default to sending to self.
export function resolveSolanaReceiver(params: {
  recipient: string | null | undefined
  recipientAddress: string | null | undefined
  account: string
}): string {
  return params.recipientAddress || params.recipient || params.account
}

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
    ],
  )

  return useSWR(key, buildSolanaTradeFlowContext).data || null
}
