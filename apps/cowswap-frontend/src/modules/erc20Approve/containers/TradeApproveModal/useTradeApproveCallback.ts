import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'
import type { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useSetOptimisticAllowance } from 'entities/optimisticAllowance/useSetOptimisticAllowance'

import { processApprovalTransaction } from './approveUtils'
import { useApprovalAnalytics } from './useApprovalAnalytics'
import { useHandleApprovalError } from './useHandleApprovalError'

import { useApproveCallback } from '../../hooks'
import { useResetApproveProgressModalState, useUpdateApproveProgressModalState } from '../../state'

interface ProcessTransactionConfirmationParams {
  response: TransactionResponse
  currency: Currency | undefined
  account: string | undefined
  spender: string | undefined
  chainId: number | undefined
  setOptimisticAllowance: (data: { tokenAddress: string; owner: string; spender: string; amount: bigint; blockNumber: number; chainId: number }) => void
}

async function processTransactionConfirmation({
  response,
  currency,
  account,
  spender,
  chainId,
  setOptimisticAllowance,
}: ProcessTransactionConfirmationParams): Promise<TradeApproveResult<TransactionReceipt>> {
  const txResponse = await response.wait()

  if (!chainId) {
    return { txResponse, approvedAmount: undefined }
  }

  const approvedAmount = processApprovalTransaction(
    {
      currency,
      account,
      spender,
      chainId,
    },
    txResponse,
  )

  if (approvedAmount) {
    setOptimisticAllowance(approvedAmount)
  }

  return { txResponse, approvedAmount: approvedAmount?.amount }
}

interface TradeApproveCallbackParams {
  useModals: boolean
  waitForTxConfirmation?: boolean
}

const DEFAULT_APPROVE_PARAMS: TradeApproveCallbackParams = {
  useModals: true,
  waitForTxConfirmation: false,
}

export type TradeApproveResult<R> = { txResponse: R; approvedAmount: bigint | undefined }

export type GenerecTradeApproveResult = TradeApproveResult<TransactionResponse> | TradeApproveResult<TransactionReceipt>

export interface TradeApproveCallback {
  (
    amount: bigint,
    params?: TradeApproveCallbackParams & {
      waitForTxConfirmation?: false
    },
  ): Promise<TradeApproveResult<TransactionResponse> | undefined>

  (
    amount: bigint,
    params: TradeApproveCallbackParams & {
      waitForTxConfirmation: true
    },
  ): Promise<TradeApproveResult<TransactionReceipt> | undefined>
}

export function useTradeApproveCallback(currency: Currency | undefined): TradeApproveCallback {
  const symbol = currency?.symbol

  const updateApproveProgressModalState = useUpdateApproveProgressModalState()
  const resetApproveProgressModalState = useResetApproveProgressModalState()
  const spender = useTradeSpenderAddress()
  const { isPartialApproveEnabled } = useFeatureFlags()
  const { chainId, account } = useWalletInfo()
  const setOptimisticAllowance = useSetOptimisticAllowance()

  const approveCallback = useApproveCallback(currency, spender)
  const approvalAnalytics = useApprovalAnalytics()
  const handleApprovalError = useHandleApprovalError(symbol)

  return useCallback(
    async (amount, { useModals = true, waitForTxConfirmation } = DEFAULT_APPROVE_PARAMS) => {
      if (useModals) {
        const amountToApprove = currency ? CurrencyAmount.fromRawAmount(currency, amount.toString()) : undefined
        updateApproveProgressModalState({ currency, approveInProgress: true, amountToApprove })
      }

      approvalAnalytics('Send', symbol)

      try {
        const response = await approveCallback(amount)

        // if ff is disabled - use old flow, hide modal when tx is sent
        if (!response || !isPartialApproveEnabled) {
          resetApproveProgressModalState()
          return undefined
        } else {
          updateApproveProgressModalState({ isPendingInProgress: true })
        }

        approvalAnalytics('Sign', symbol)

        if (waitForTxConfirmation) {
          return await processTransactionConfirmation({
            response,
            currency,
            account,
            spender,
            chainId,
            setOptimisticAllowance,
          })
        } else {
          return { txResponse: response, approvedAmount: undefined }
        }
      } catch (error) {
        handleApprovalError(error)
        return undefined
      } finally {
        updateApproveProgressModalState({
          currency,
          approveInProgress: false,
          amountToApprove: undefined,
          isPendingInProgress: false,
        })
      }
    },
    [
      approvalAnalytics,
      symbol,
      currency,
      updateApproveProgressModalState,
      approveCallback,
      isPartialApproveEnabled,
      resetApproveProgressModalState,
      account,
      spender,
      chainId,
      setOptimisticAllowance,
      handleApprovalError,
    ],
  ) as TradeApproveCallback
}
