import { atom, useAtomValue } from 'jotai'

import { CowHook } from 'modules/hooksStore/types/hooks'

import { getSimulationLink } from '../const'
import { TenderlyBundleSimulationResponse } from '../types'
import { PostBundleSimulationParams } from '../utils/bundleSimulation'

export interface SimulationData {
  tenderlySimulationLink: string
  simulationPassed: boolean
  isSimulationSuccessful: boolean
}

export const simulationAtom = atom<Record<string, SimulationData>>({})

export const EMPTY_STATE = {
  tenderlySimulationLink: '',
  simulationPassed: false,
  isSimulationSuccessful: false,
}

export function useHookSimulationData(hook: CowHook) {
  const simulationsValues = useAtomValue(simulationAtom)

  return simulationsValues[getHookSimulationKey(hook)] || EMPTY_STATE
}

export function getHookSimulationKey(hook: CowHook) {
  return [hook.target, hook.callData, hook.gasLimit].join(':')
}

export function generateSimulationDataToError(postParams: PostBundleSimulationParams): Record<string, SimulationData> {
  const preHooksKeys = postParams.preHooks.map(getHookSimulationKey)
  const postHooksKeys = postParams.postHooks.map(getHookSimulationKey)
  const hooksKeys = [...preHooksKeys, ...postHooksKeys]

  return hooksKeys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: { tenderlySimulationLink: '', simulationPassed: false, isSimulationSuccessful: false },
    }),
    {},
  )
}

export function generateNewSimulationData(
  bundleSimulationResponse: TenderlyBundleSimulationResponse,
  postParams: PostBundleSimulationParams,
): Record<string, SimulationData> {
  const preHooksKeys = postParams.preHooks.map(getHookSimulationKey)
  const postHooksKeys = postParams.postHooks.map(getHookSimulationKey)

  const preHooksData = bundleSimulationResponse.simulation_results.slice(0, preHooksKeys.length).map((simulation) => ({
    tenderlySimulationLink: getSimulationLink(simulation.simulation.id),
    simulationPassed: true,
    isSimulationSuccessful: simulation.simulation.status,
  }))

  const postHooksData = bundleSimulationResponse.simulation_results.slice(preHooksKeys.length).map((simulation) => ({
    tenderlySimulationLink: getSimulationLink(simulation.simulation.id),
    simulationPassed: true,
    isSimulationSuccessful: simulation.simulation.status,
  }))

  return {
    ...preHooksKeys.reduce((acc, key, index) => ({ ...acc, [key]: preHooksData[index] }), {}),
    ...postHooksKeys.reduce((acc, key, index) => ({ ...acc, [key]: postHooksData[index] }), {}),
  }
}
