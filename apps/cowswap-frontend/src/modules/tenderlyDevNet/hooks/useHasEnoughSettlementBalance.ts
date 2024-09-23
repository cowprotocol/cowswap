import { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useGetSettlementBalance } from './useGetSettlementBalance'

import { GetSettlementBalanceCacheParams } from '../types'

export function useHasEnoughSettlementBalance() {
  const getSettlementBalance = useGetSettlementBalance()

  return useCallback(
    async (params: { balance: CurrencyAmount<Currency> } & GetSettlementBalanceCacheParams) => {
      const settlementBalance = await getSettlementBalance(params)
      if (!settlementBalance) return false
      return params.balance.lessThan(settlementBalance)
    },
    [getSettlementBalance],
  )
}
