import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from '@cowprotocol/cow-sdk'

import { constants } from 'ethers'

import { storeSettlementBalanceCacheAtom } from '../state/settlementBalance'
import { GetSettlementBalanceCacheParams } from '../types'
import { addErc20Balance } from '../utils'

export function useIncreaseSettlementBalance(): (params: GetSettlementBalanceCacheParams) => Promise<string> {
  const storeSettlementBalanceCache = useSetAtom(storeSettlementBalanceCacheAtom)
  return useCallback(
    async (params: GetSettlementBalanceCacheParams) => {
      const tx = await addErc20Balance(
        params.tokenAddress,
        COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[params.chainId],
        constants.MaxUint256.toHexString(),
      )
      storeSettlementBalanceCache({ ...params, balance: constants.MaxUint256.div(2).toString() })
      return tx.hash
    },
    [storeSettlementBalanceCache],
  )
}
