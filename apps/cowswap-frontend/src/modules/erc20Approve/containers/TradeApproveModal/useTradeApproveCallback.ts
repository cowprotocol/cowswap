import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { errorToString, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency } from '@uniswap/sdk-core'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { useApproveCallback } from '../../hooks'
import { useUpdateTradeApproveState } from '../../state'

interface TradeApproveCallbackParams {
  useModals: boolean
}

export interface TradeApproveCallback {
  (amount: bigint, params?: TradeApproveCallbackParams): Promise<TransactionResponse | undefined>
}

export function useTradeApproveCallback(currency: Currency | undefined): TradeApproveCallback {
  const updateTradeApproveState = useUpdateTradeApproveState()
  const spender = useTradeSpenderAddress()
  const symbol = currency?.symbol
  const cowAnalytics = useCowAnalytics()
  const provider = useWalletProvider()

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

  return useCallback(
    async (amount, { useModals = true } = { useModals: true }) => {
      if (useModals) {
        updateTradeApproveState({ currency, approveInProgress: true })
      }

      approvalAnalytics('Send', symbol)

      return approveCallback(amount)
        .then((response) => {
          approvalAnalytics('Sign', symbol)
          return response && provider ? provider.waitForTransaction(response?.hash).then(() => response) : response
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
    [symbol, approveCallback, updateTradeApproveState, currency, approvalAnalytics, provider],
  )
}
