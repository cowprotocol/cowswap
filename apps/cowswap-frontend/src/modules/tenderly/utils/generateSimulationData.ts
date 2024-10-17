import { PostBundleSimulationParams } from './bundleSimulation'

import { SimulationData } from '../types'

export function generateSimulationDataToError(
  postParams: Pick<PostBundleSimulationParams, 'preHooks' | 'postHooks'>,
): Record<string, SimulationData> {
  const preHooksKeys = postParams.preHooks.map((hookDetails) => hookDetails.uuid)
  const postHooksKeys = postParams.postHooks.map((hookDetails) => hookDetails.uuid)
  const hooksKeys = [...preHooksKeys, ...postHooksKeys]

  return hooksKeys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: { link: '', status: false, id: key },
    }),
    {},
  )
}

export function generateNewSimulationData(
  simulationData: SimulationData[],
  postParams: Pick<PostBundleSimulationParams, 'preHooks' | 'postHooks'>,
): Record<string, SimulationData> {
  const preHooksKeys = postParams.preHooks.map((hookDetails) => hookDetails.uuid)
  const postHooksKeys = postParams.postHooks.map((hookDetails) => hookDetails.uuid)

  const preHooksData = simulationData.slice(0, preHooksKeys.length)

  const postHooksData = simulationData.slice(-postHooksKeys.length)

  return {
    ...preHooksKeys.reduce((acc, key, index) => ({ ...acc, [key]: preHooksData[index] }), {}),
    ...postHooksKeys.reduce((acc, key, index) => ({ ...acc, [key]: postHooksData[index] }), {}),
  }
}
