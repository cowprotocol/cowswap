import { useCallback } from 'react'

import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowHook } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { TENDERLY_SIMULATE_ENDPOINT_URL } from '../const'
import { SimulationError, TenderlySimulatePayload, TenderlySimulation } from '../types/TenderlySimulation'

export function useTenderlySimulate(): (params: CowHook) => Promise<TenderlySimulation | SimulationError> {
  const { account, chainId } = useWalletInfo()
  const settlementContract = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId]

  return useCallback(
    async (params: CowHook) => {
      const response = await fetch(TENDERLY_SIMULATE_ENDPOINT_URL, {
        method: 'POST',
        body: JSON.stringify(getTenderlySimulationInput(settlementContract, chainId, params)),
      }).then((res) => res.json())

      return response as TenderlySimulation | SimulationError
    },
    [account, chainId]
  )
}

function getTenderlySimulationInput(from: string, chainId: SupportedChainId, params: CowHook): TenderlySimulatePayload {
  return {
    input: params.callData,
    to: params.target,
    gas: +params.gasLimit,
    from,
    gas_price: '0',
    network_id: chainId.toString(),
    save: true,
    save_if_fails: true,
  }
}
