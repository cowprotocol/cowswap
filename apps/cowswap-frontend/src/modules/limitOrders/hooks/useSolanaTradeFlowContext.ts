import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useDispatch } from 'react-redux'
import useSWR from 'swr'

import { AppDispatch } from 'legacy/state'
import { useCloseModals } from 'legacy/state/application/hooks'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useAppData } from 'modules/appData'
import { useGetAmountToSignApprove } from 'modules/erc20Approve'
import { useTradeConfirmActions } from 'modules/trade'
import {
  buildSolanaContextKey,
  buildSolanaTradeFlowContext,
  getSolanaDelegationAmount,
  getSolanaSellToken,
  SolanaTradeFlowContext,
  useSolanaSigner,
} from 'modules/tradeFlow'
import { getIsFinalQuote, useTradeQuote } from 'modules/tradeQuote'

import { useSolanaDelegationAllowance } from 'common/hooks/useSolanaDelegationAllowance'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

import { limitOrdersSettingsAtom } from '../state/limitOrdersSettingsAtom'
import { calculateLimitOrdersDeadline } from '../utils/calculateLimitOrdersDeadline'

export function useSolanaTradeFlowContext(): SolanaTradeFlowContext | null {
  const { chainId, account } = useWalletInfo()
  const { inputCurrency, inputCurrencyAmount, outputCurrencyAmount, recipient, recipientAddress, orderKind } =
    useLimitOrdersDerivedState()
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const tradeQuoteState = useTradeQuote()
  const closeModals = useCloseModals()
  const dispatch = useDispatch<AppDispatch>()
  const tradeConfirmActions = useTradeConfirmActions()
  const addTransaction = useTransactionAdder()
  const solana = useSolanaSigner(account)
  const appData = useAppData()

  const sellToken = getSolanaSellToken(inputCurrency)
  // Mirrors modules/tradeFlow's own hook: the Solana quote always reports its sellToken as WSOL for
  // a native sell, so the wrap step's native check must read the user's actual selection.
  const isNativeSell = Boolean(inputCurrency && getIsNativeToken(inputCurrency))
  const currentDelegation = useSolanaDelegationAllowance(sellToken?.address)
  const amountToApprove = useGetAmountToSignApprove()

  const sellAmountRaw = inputCurrencyAmount ? BigInt(inputCurrencyAmount.quotient.toString()) : 0n

  const validTo = calculateLimitOrdersDeadline(settingsState, tradeQuoteState)
  const quote = tradeQuoteState.quote
  const isFinalQuote = getIsFinalQuote(tradeQuoteState.fetchParams)

  const key = useMemo(
    () =>
      buildSolanaContextKey({
        isFinalQuote,
        account,
        chainId,
        quote,
        inputAmount: inputCurrencyAmount ?? undefined,
        outputAmount: outputCurrencyAmount ?? undefined,
        uiOrderType: UiOrderType.LIMIT,
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
        orderClass: OrderClass.LIMIT,
        partiallyFillable: settingsState.partialFillsEnabled,
        appData,
      }),
    [
      chainId,
      account,
      inputCurrencyAmount,
      outputCurrencyAmount,
      quote,
      isFinalQuote,
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
      settingsState.partialFillsEnabled,
      appData,
    ],
  )

  return useSWR(key, buildSolanaTradeFlowContext).data || null
}
