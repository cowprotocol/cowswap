import { atom, useAtomValue } from 'jotai'

import { CowHook } from 'modules/hooksStore/types/hooks'

import { getSimulationLink } from '../const'
import { TenderlyBundleSimulationResponse } from '../types'
import { PostBundleSimulationParams } from '../utils/bundleSimulation'

export const simulationLinksAtom = atom<Record<string, string>>({})

export function useHookSimulationLink(hook: CowHook) {
  const simulationsValues = useAtomValue(simulationLinksAtom)

  return simulationsValues[getHookSimulationKey(hook)]
}

export function getHookSimulationKey(hook: CowHook) {
  return [hook.target, hook.callData, hook.gasLimit].join(':')
}

export function generateNewHookSimulationLinks(
  bundleSimulationResponse: TenderlyBundleSimulationResponse,
  postParams: PostBundleSimulationParams,
) {
  const preHooksKeys = postParams.preHooks.map(getHookSimulationKey)
  const postHooksKeys = postParams.postHooks.map(getHookSimulationKey)
  const swapKeys = ['sellTransfer', 'buyTransfer']

  const keys = [...preHooksKeys, ...swapKeys, ...postHooksKeys]

  return keys.reduce(
    (acc, key, index) => {
      if (bundleSimulationResponse.simulation_results.length <= index) {
        return acc
      }
      acc[key] = getSimulationLink(bundleSimulationResponse.simulation_results[index].simulation.id)
      return acc
    },
    {} as Record<string, string>,
  )
}
