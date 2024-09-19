import { useCallback } from 'react'

import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { BUNDLE_TENDERLY_SIMULATE_ENDPOINT_URL } from '../const'
import { CowHook } from '../types/hooks'
import { SimulationError, TenderlySimulatePayload, TenderlySimulation } from '../types/TenderlySimulation'

export type BundleTenderlySimulationResult = {
  simulation_results: TenderlySimulation[]
}

export function useTenderlyBundleSimulate(): (
  params: CowHook[],
) => Promise<BundleTenderlySimulationResult | SimulationError> {
  const { account, chainId } = useWalletInfo()
  const settlementContract = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId]

  return useCallback(
    async (params: CowHook[]) => {
      const response = await fetch(BUNDLE_TENDERLY_SIMULATE_ENDPOINT_URL, {
        method: 'POST',
        body: JSON.stringify(getTenderlySimulationInput(settlementContract, chainId, params)),
        headers: {
          'X-Access-Key': process.env.REACT_APP_TENDERLY_ACCESS_KEY || '',
        },
      }).then((res) => res.json())

      return response as BundleTenderlySimulationResult | SimulationError
    },
    [account, chainId],
  )
}

function getTenderlySimulationInput(
  from: string,
  chainId: SupportedChainId,
  cowHooks: CowHook[],
): { simulations: TenderlySimulatePayload[] } {
  return {
    simulations: cowHooks.map((cowHook) => {
      return {
        input: cowHook.callData,
        to: cowHook.target,
        gas: +cowHook.gasLimit,
        from,
        gas_price: '0',
        network_id: chainId.toString(),
        save: true,
        save_if_fails: true,
      }
    }),
  }
}
