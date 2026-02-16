import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { ZERO_ADDRESS } from '@cowprotocol/common-const'

import { useConfig } from 'wagmi'
import { readContract } from 'wagmi/actions'

import { useEthFlowContractData } from 'common/hooks/useContract'

import { ethFlowInFlightOrderIdsAtom } from '../state/ethFlowInFlightOrderIdsAtom'

import type { Hex } from 'viem'

export interface EthFlowOrderExistsCallback {
  (orderId: string, orderDigest: string): Promise<boolean>
}

export function useCheckEthFlowOrderExists(): EthFlowOrderExistsCallback {
  const config = useConfig()
  const ethFlowInFlightOrderIds = useAtomValue(ethFlowInFlightOrderIdsAtom)
  const ethFlowContract = useEthFlowContractData()

  return useCallback(
    async (orderId: string, orderDigest: string) => {
      if (ethFlowInFlightOrderIds.includes(orderId)) {
        return true
      }

      if (ethFlowContract) {
        try {
          const [owner] = await readContract(config, {
            abi: ethFlowContract.abi,
            address: ethFlowContract.address,
            functionName: 'orders',
            args: [orderDigest as Hex],
          })

          return owner.toLowerCase() !== ZERO_ADDRESS
        } catch (e) {
          console.error('Eth-flow order existing check error: ', e)

          return false
        }
      }

      return false
    },
    [config, ethFlowInFlightOrderIds, ethFlowContract],
  )
}
