import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { errorToString, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import type { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useApproveCowAnalytics } from './useApproveCowAnalytics'

import { useApproveCallback } from '../../hooks'
import { useResetApproveProgressModalState, useUpdateApproveProgressModalState } from '../../state'

const EVM_TX_HASH_LENGTH = 64 + 2

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
  const updateApproveProgressModalState = useUpdateApproveProgressModalState()
  const resetApproveProgressModalState = useResetApproveProgressModalState()
  const spender = useTradeSpenderAddress()
  const symbol = currency?.symbol
  const { isPartialApproveEnabled } = useFeatureFlags()

  const approveCallback = useApproveCallback(currency, spender)
  const approvalAnalytics = useApproveCowAnalytics()

  const handleApprovalError = useCallback(
    (error: unknown) => {
      console.error('Error setting the allowance for token', error)

      if (isRejectRequestProviderError(error)) {
        updateApproveProgressModalState({ error: 'User rejected approval transaction' })
      } else {
        const errorCode = getErrorCode(error)
        approvalAnalytics('Error', symbol, errorCode)
        updateApproveProgressModalState({ error: errorToString(error) })
      }
    },
    [updateApproveProgressModalState, approvalAnalytics, symbol],
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
        updateApproveProgressModalState({ currency, approveInProgress: true, amountToApprove })
      }

      approvalAnalytics('Send', symbol)

      try {
        const response = await approveCallback(amount)

        if (!response) {
          resetApproveProgressModalState()
          return undefined
        }

        approvalAnalytics('Sign', symbol)
        // if ff is disabled - use old flow, hide modal when tx is sent
        if (isPartialApproveEnabled) {
          updateApproveProgressModalState({ isPendingInProgress: true })
        } else {
          resetApproveProgressModalState()
        }

        return await waitForTransaction(response, waitForTxConfirmation)
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
      handleApprovalError,
    ],
  ) as TradeApproveCallback
}

async function waitForTransaction(
  response: TransactionResponse,
  waitForTxConfirmation: boolean,
): Promise<TransactionResponse | TransactionReceipt | undefined> {
  // Check the length to skip waiting for Safe tx
  // We have to return undefined in order to avoid jumping into confirm screen after approval tx sending
  if (response.hash.length !== EVM_TX_HASH_LENGTH) {
    return undefined
  }

  if (waitForTxConfirmation) {
    // need to wait response to run finally clause after that
    return response.wait()
  } else {
    return response
  }
}
