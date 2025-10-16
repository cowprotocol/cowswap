import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'
import type { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency } from '@uniswap/sdk-core'

import { useSetOptimisticAllowance } from 'entities/optimisticAllowance/useSetOptimisticAllowance'

import { processApprovalTransaction } from './approveUtils'
import { useApprovalAnalytics } from './useApprovalAnalytics'
import { useHandleApprovalError } from './useHandleApprovalError'

import { useApproveCallback } from '../../hooks'
import { useUpdateTradeApproveState } from '../../state'

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

  const updateTradeApproveState = useUpdateTradeApproveState()
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
        updateTradeApproveState({ currency, approveInProgress: true })
      }

      approvalAnalytics('Send', symbol)

      try {
        const response = await approveCallback(amount)

        // if ff is disabled - use old flow, hide modal when tx is sent
        if (!response || !isPartialApproveEnabled) {
          updateTradeApproveState({ currency: undefined, approveInProgress: false })
          return undefined
        }

        approvalAnalytics('Sign', symbol)

        if (waitForTxConfirmation) {
          // need to wait response to run finally clause after that
          const txResponse = await response.wait()

          // Set optimistic allowance immediately after transaction is mined
          // Extract the actual approved amount from transaction logs
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
        } else {
          return { txResponse: response, approvedAmount: undefined }
        }
      } catch (error) {
        handleApprovalError(error)
        return undefined
      } finally {
        updateTradeApproveState({ currency: undefined, approveInProgress: false })
      }
    },
    [
      symbol,
      approveCallback,
      updateTradeApproveState,
      currency,
      approvalAnalytics,
      isPartialApproveEnabled,
      account,
      spender,
      chainId,
      setOptimisticAllowance,
      handleApprovalError,
    ],
  ) as TradeApproveCallback
}
