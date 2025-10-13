import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { errorToString, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useApproveCowAnalytics } from './useApproveCowAnalytics'

import { useApproveCallback } from '../../hooks'
import { useUpdateTradeApproveState } from '../../state'

interface TradeApproveCallbackParams {
  useModals: boolean
  waitForTxConfirmation?: boolean
}

export interface TradeApproveCallback {
  (
    amount: bigint,
    params?: TradeApproveCallbackParams & {
      waitForTxConfirmation?: false
    },
  ): Promise<TransactionResponse | undefined>

  (
    amount: bigint,
    params: TradeApproveCallbackParams & {
      waitForTxConfirmation: true
    },
  ): Promise<TransactionReceipt | undefined>
}

function getErrorCode(error: unknown): number | null {
  return error && typeof error === 'object' && 'code' in error && typeof error.code === 'number' ? error.code : null
}

export function useTradeApproveCallback(currency: Currency | undefined): TradeApproveCallback {
  const updateTradeApproveState = useUpdateTradeApproveState()
  const spender = useTradeSpenderAddress()
  const symbol = currency?.symbol
  const { isPartialApproveEnabled } = useFeatureFlags()

  const approveCallback = useApproveCallback(currency, spender)
  const approvalAnalytics = useApproveCowAnalytics()

  const handleApprovalError = useCallback(
    (error: unknown) => {
      console.error('Error setting the allowance for token', error)

      if (isRejectRequestProviderError(error)) {
        updateTradeApproveState({ error: 'User rejected approval transaction' })
      } else {
        const errorCode = getErrorCode(error)
        approvalAnalytics('Error', symbol, errorCode)
        updateTradeApproveState({ error: errorToString(error) })
      }
    },
    [updateTradeApproveState, approvalAnalytics, symbol],
  )

  return useCallback(
    async (
      amount,
      { useModals = true, waitForTxConfirmation = false } = {
        useModals: true,
        waitForTxConfirmation: false,
      },
    ) => {
      if (useModals) {
        const amountToApprove = currency ? CurrencyAmount.fromRawAmount(currency, amount.toString()) : undefined
        updateTradeApproveState({ currency, approveInProgress: true, amountToApprove })
      }

      approvalAnalytics('Send', symbol)

      try {
        const response = await approveCallback(amount)

        if (!response) {
          updateTradeApproveState({ currency: undefined, approveInProgress: false, amountToApprove: undefined })
          return undefined
        }

        approvalAnalytics('Sign', symbol)
        // if ff is disabled - use old flow, hide modal when tx is sent
        if (isPartialApproveEnabled) {
          updateTradeApproveState({ isPendingInProgress: true })
        } else {
          updateTradeApproveState({ currency: undefined, approveInProgress: false, amountToApprove: undefined })
        }

        if (waitForTxConfirmation) {
          // need to wait response to run finally clause after that
          const resp = await response.wait()
          return resp
        } else {
          return response
        }
      } catch (error) {
        handleApprovalError(error)
        return undefined
      } finally {
        updateTradeApproveState({
          currency: undefined,
          approveInProgress: false,
          isPendingInProgress: false,
          amountToApprove: undefined,
        })
      }
    },
    [
      symbol,
      approveCallback,
      updateTradeApproveState,
      currency,
      approvalAnalytics,
      isPartialApproveEnabled,
      handleApprovalError,
    ],
  ) as TradeApproveCallback
}
