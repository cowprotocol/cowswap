import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useGetTokenBalanceSlot } from './useGetTokenBalanceSlot'

import { generateNewHookSimulationLinks, simulationLinksAtom } from '../state/simulationLink'
import { bundleSimulation, PostBundleSimulationParams } from '../utils/bundleSimulation'
import { checkBundleSimulationError } from '../utils/checkBundleSimulationError'

export function useTenderlyBundleSimulate(): (
  params: Omit<PostBundleSimulationParams, 'slotOverride'>,
) => Promise<boolean | undefined> {
  const { account, chainId } = useWalletInfo()
  const getTokenBalanceSlot = useGetTokenBalanceSlot()
  const setLinks = useSetAtom(simulationLinksAtom)

  return useCallback(
    async (params: Omit<PostBundleSimulationParams, 'slotOverride'>): Promise<boolean | undefined> => {
      if (!account) {
        return
      }
      const balanceSlot = await getTokenBalanceSlot({
        tokenAddress: params.tokenBuy.address,
        chainId,
      })
      if (!balanceSlot) {
        return
      }

      const paramsWithSlot = {
        ...params,
        slotOverride: balanceSlot,
      }
      const response = await bundleSimulation(paramsWithSlot)

      if (checkBundleSimulationError(response)) return false
      const simulationLinks = generateNewHookSimulationLinks(response, paramsWithSlot)
      setLinks(simulationLinks)
      return true
    },
    [account, chainId, getTokenBalanceSlot, setLinks],
  )
}
