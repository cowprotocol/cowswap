import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { ZERO_ADDRESS } from '@cowprotocol/common-const'

import { useEthFlowContract } from 'common/hooks/useContract'

import { ethFlowInFlightOrderIdsAtom } from '../state/ethFlowInFlightOrderIdsAtom'

export interface EthFlowOrderExistsCallback {
  (orderId: string, orderDigest: string): Promise<boolean>
}

export function useCheckEthFlowOrderExists(): EthFlowOrderExistsCallback {
  const ethFlowInFlightOrderIds = useAtomValue(ethFlowInFlightOrderIdsAtom)
  const {
    result: { contract: ethFlowContract },
  } = useEthFlowContract()

  return useCallback(
    async (orderId: string, orderDigest: string) => {
      if (ethFlowInFlightOrderIds.includes(orderId)) {
        return true
      }

      if (ethFlowContract) {
        try {
          const { owner } = await ethFlowContract.callStatic.orders(orderDigest)

          return owner.toLowerCase() !== ZERO_ADDRESS
        } catch (e) {
          console.error('Eth-flow order existing check error: ', e)

          return false
        }
      }

      return false
    },
    [ethFlowInFlightOrderIds, ethFlowContract],
  )
}
