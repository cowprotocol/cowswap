import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { errorToString, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency } from '@uniswap/sdk-core'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

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

export function useTradeApproveCallback(currency: Currency | undefined): TradeApproveCallback {
  const updateTradeApproveState = useUpdateTradeApproveState()
  const spender = useTradeSpenderAddress()
  const symbol = currency?.symbol
  const cowAnalytics = useCowAnalytics()
  const { isPartialApproveEnabled } = useFeatureFlags()

  const approveCallback = useApproveCallback(currency, spender)

  const approvalAnalytics = useCallback(
    (action: string, symbol?: string, errorCode?: number | null) => {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.TRADE,
        action,
        label: symbol,
        ...(errorCode && { value: errorCode }),
      })
    },
    [cowAnalytics],
  )

  const handleApprovalError = useCallback(
    (error: unknown) => {
      console.error('Error setting the allowance for token', error)

      if (isRejectRequestProviderError(error)) {
        updateTradeApproveState({ error: 'User rejected approval transaction' })
      } else {
        const errorCode =
          error && typeof error === 'object' && 'code' in error && typeof error.code === 'number' ? error.code : null
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
        updateTradeApproveState({ currency, approveInProgress: true })
      }

      approvalAnalytics('Send', symbol)

      try {
        const response = await approveCallback(amount)

        if (!response) {
          updateTradeApproveState({ currency: undefined, approveInProgress: false })
          return undefined
        }

        approvalAnalytics('Sign', symbol)
        // if ff is disabled - use old flow, hide modal when tx is sent
        !isPartialApproveEnabled && updateTradeApproveState({ currency: undefined, approveInProgress: false })

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
      handleApprovalError,
    ],
  ) as TradeApproveCallback
}
