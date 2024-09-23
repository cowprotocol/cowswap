import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { TENDERLY_TESTNET_PROVIDER } from '../const'
import { getSettlementBalanceCacheAtom, storeSettlementBalanceCacheAtom } from '../state/settlementBalance'
import { GetSettlementBalanceCacheParams } from '../types'

export function useGetSettlementBalance(): (params: GetSettlementBalanceCacheParams) => Promise<string | undefined> {
  const getCachedSettlementBalance = useSetAtom(getSettlementBalanceCacheAtom)
  const storeSettlementBalanceCache = useSetAtom(storeSettlementBalanceCacheAtom)
  return useCallback(
    async (params: GetSettlementBalanceCacheParams) => {
      const cachedBalance = getCachedSettlementBalance(params)
      if (cachedBalance) {
        return cachedBalance
      }
      try {
        const fetchedBalance = await TENDERLY_TESTNET_PROVIDER.getBalance(params.tokenAddress).then((balance) =>
          balance.toString(),
        )
        storeSettlementBalanceCache({ ...params, balance: fetchedBalance })
        return fetchedBalance
      } catch {
        console.error('Error fetching cached settlement balance')
        return
      }
    },
    [getCachedSettlementBalance, storeSettlementBalanceCache],
  )
}
