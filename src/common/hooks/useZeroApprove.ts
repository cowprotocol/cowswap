import { useCallback } from 'react'
import { useTradeSpenderAddress } from './useTradeSpenderAddress'
import { useApproveCallback } from './useApproveCallback'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useSetAtom } from 'jotai'
import { zeroApprovalState } from '../state/useZeroApprovalState'

export function useZeroApprove(currency: Currency) {
  const setZeroApprovalState = useSetAtom(zeroApprovalState)
  const spender = useTradeSpenderAddress()
  const amountToApprove = CurrencyAmount.fromRawAmount(currency, 0)
  const approveCallback = useApproveCallback(amountToApprove, spender)
  return useCallback(async () => {
    try {
      setZeroApprovalState({ isApproving: true, currency })
      await approveCallback()
    } finally {
      setZeroApprovalState({ isApproving: false })
    }
  }, [approveCallback, setZeroApprovalState, currency])
}
