import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { errorToString, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { useApproveCallback } from 'common/hooks/useApproveCallback'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

import { useUpdateTradeApproveState } from '../../hooks/useUpdateTradeApproveState'

interface TradeApproveCallbackParams {
  useModals: boolean
}

export interface TradeApproveCallback {
  (params?: TradeApproveCallbackParams): Promise<TransactionResponse | undefined>
}

export function useTradeApproveCallback(amountToApprove?: CurrencyAmount<Currency>): TradeApproveCallback {
  const updateTradeApproveState = useUpdateTradeApproveState()
  const spender = useTradeSpenderAddress()
  const currency = amountToApprove?.currency
  const symbol = currency?.symbol
  const cowAnalytics = useCowAnalytics()

  const approveCallback = useApproveCallback(amountToApprove, spender)

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

  return useCallback(
    async ({ useModals = true }: TradeApproveCallbackParams = { useModals: true }) => {
      if (useModals) {
        updateTradeApproveState({ currency, approveInProgress: true })
      }

      approvalAnalytics('Send', symbol)

      return approveCallback()
        .then((response) => {
          approvalAnalytics('Sign', symbol)
          return response
        })
        .finally(() => {
          updateTradeApproveState({ currency: undefined, approveInProgress: false })
        })
        .catch((error) => {
          console.error('Error setting the allowance for token', error)

          if (isRejectRequestProviderError(error)) {
            updateTradeApproveState({ error: 'User rejected approval transaction' })
          } else {
            const errorCode = error?.code && typeof error.code === 'number' ? error.code : null

            approvalAnalytics('Error', symbol, errorCode)
            updateTradeApproveState({ error: errorToString(error) })
          }

          return undefined
        })
    },
    [symbol, approveCallback, updateTradeApproveState, currency, approvalAnalytics],
  )
}
