import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSetOptimisticAllowance } from 'entities/optimisticAllowance/useSetOptimisticAllowance'
import { usePublicClient } from 'wagmi'

import { processApprovalTransaction } from './approveUtils'
import { useApprovalAnalytics } from './useApprovalAnalytics'
import { useHandleApprovalError } from './useHandleApprovalError'

import { useApproveCallback } from '../../hooks'
import { useResetApproveProgressModalState, useUpdateApproveProgressModalState } from '../../state'

import type { ApprovalTxReceipt } from './approveUtils'

interface TradeApproveCallbackParams {
  useModals: boolean
  waitForTxConfirmation?: boolean
}

const EVM_TX_HASH_LENGTH = 64 + 2

const DEFAULT_APPROVE_PARAMS: TradeApproveCallbackParams = {
  useModals: true,
  waitForTxConfirmation: false,
}

export type ApproveTxResponse = { hash: `0x${string}` }

export type GenerecTradeApproveResult = TradeApproveResult<ApproveTxResponse> | TradeApproveResult<ApprovalTxReceipt>

export interface TradeApproveCallback {
  (
    amount: bigint,
    params?: TradeApproveCallbackParams & {
      waitForTxConfirmation?: false
    },
  ): Promise<TradeApproveResult<ApproveTxResponse> | undefined>

  (
    amount: bigint,
    params: TradeApproveCallbackParams & {
      waitForTxConfirmation: true
    },
  ): Promise<TradeApproveResult<ApprovalTxReceipt> | undefined>
}

export type TradeApproveResult<R> = { txResponse: R; approvedAmount: bigint | undefined }

interface ProcessTransactionConfirmationParams {
  hash: `0x${string}`
  currency: Currency | undefined
  account: string | undefined
  spender: string | undefined
  chainId: number | undefined
  setOptimisticAllowance: (data: {
    tokenAddress: string
    owner: string
    spender: string
    amount: bigint
    blockNumber: bigint
    chainId: number
  }) => void
}

export function useTradeApproveCallback(currency: Currency | undefined): TradeApproveCallback {
  const symbol = currency?.symbol

  const updateApproveProgressModalState = useUpdateApproveProgressModalState()
  const resetApproveProgressModalState = useResetApproveProgressModalState()
  const spender = useTradeSpenderAddress()
  const { chainId, account } = useWalletInfo()
  const publicClient = usePublicClient()
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

        if (!response) {
          resetApproveProgressModalState()
          return undefined
        }

        updateApproveProgressModalState({ isPendingInProgress: true })

        approvalAnalytics('Sign', symbol)

        // Check the length to skip waiting for Safe tx
        // We have to return undefined in order to avoid jumping into confirm screen after approval tx sending
        if (response.hash.length !== EVM_TX_HASH_LENGTH) {
          return undefined
        }

        if (waitForTxConfirmation && publicClient) {
          return await processTransactionConfirmation({
            hash: response.hash,
            currency,
            account,
            spender,
            chainId,
            setOptimisticAllowance,
            publicClient,
          })
        } else {
          return { txResponse: { hash: response.hash }, approvedAmount: undefined }
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
      resetApproveProgressModalState,
      account,
      spender,
      chainId,
      publicClient,
      setOptimisticAllowance,
      handleApprovalError,
    ],
  ) as TradeApproveCallback
}

async function processTransactionConfirmation({
  hash,
  currency,
  account,
  spender,
  chainId,
  setOptimisticAllowance,
  publicClient,
}: ProcessTransactionConfirmationParams & { publicClient: NonNullable<ReturnType<typeof usePublicClient>> }): Promise<
  TradeApproveResult<ApprovalTxReceipt>
> {
  const txResponse = await publicClient.waitForTransactionReceipt({ hash })

  const receipt: ApprovalTxReceipt = {
    status: txResponse.status,
    blockNumber: txResponse.blockNumber,
    transactionHash: txResponse.transactionHash,
    logs: txResponse.logs.map((log) => ({
      address: log.address,
      topics: [...log.topics],
      data: log.data,
    })),
  }

  if (!chainId) {
    return { txResponse: receipt, approvedAmount: undefined }
  }

  const approvedAmount = processApprovalTransaction(
    {
      currency,
      account,
      spender,
      chainId,
    },
    receipt,
  )

  if (approvedAmount) {
    setOptimisticAllowance(approvedAmount)
  }

  return { txResponse: receipt, approvedAmount: approvedAmount?.amount }
}
