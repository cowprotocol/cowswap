import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { useApproveCallback } from 'common/hooks/useApproveCallback'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'
import { approvalAnalytics } from 'legacy/components/analytics'
import { isRejectRequestProviderError } from 'legacy/utils/misc'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { updateTradeApproveStateAtom } from './tradeApproveStateAtom'

interface TradeApproveCallbackParams {
  useModals: boolean
}

export interface TradeApproveCallback {
  (params?: TradeApproveCallbackParams): Promise<TransactionResponse | undefined>
}

export function useTradeApproveCallback(amountToApprove?: CurrencyAmount<Currency>): TradeApproveCallback {
  const updateTradeApproveState = useSetAtom(updateTradeApproveStateAtom)
  const spender = useTradeSpenderAddress()
  const currency = amountToApprove?.currency
  const symbol = currency?.symbol

  const approveCallback = useApproveCallback(amountToApprove, spender)

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

          if (!isRejectRequestProviderError(error)) {
            const errorCode = error?.code && typeof error.code === 'number' ? error.code : null

            approvalAnalytics('Error', symbol, errorCode)
          }

          throw error
        })
    },
    [symbol, approveCallback, updateTradeApproveState, currency]
  )
}
