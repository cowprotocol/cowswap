import { PostBundleSimulationParams } from './bundleSimulation'

import { getSimulationLink } from '../const'
import { SimulationData, TenderlyBundleSimulationResponse } from '../types'

export function generateSimulationDataToError(postParams: PostBundleSimulationParams): Record<string, SimulationData> {
  const preHooksKeys = postParams.preHooks.map(({ hookDetails }) => hookDetails.uuid)
  const postHooksKeys = postParams.postHooks.map(({ hookDetails }) => hookDetails.uuid)
  const hooksKeys = [...preHooksKeys, ...postHooksKeys]

  return hooksKeys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: { tenderlySimulationLink: '', simulationPassed: false },
    }),
    {},
  )
}

export function generateNewSimulationData(
  bundleSimulationResponse: TenderlyBundleSimulationResponse,
  postParams: PostBundleSimulationParams,
): Record<string, SimulationData> {
  const preHooksKeys = postParams.preHooks.map(({ hookDetails }) => hookDetails.uuid)
  const postHooksKeys = postParams.postHooks.map(({ hookDetails }) => hookDetails.uuid)

  const preHooksData = bundleSimulationResponse.simulation_results.slice(0, preHooksKeys.length).map((simulation) => ({
    tenderlySimulationLink: getSimulationLink(simulation.simulation.id),
    simulationPassed: simulation.simulation.status,
  }))

  const postHooksData = bundleSimulationResponse.simulation_results.slice(preHooksKeys.length).map((simulation) => ({
    tenderlySimulationLink: getSimulationLink(simulation.simulation.id),
    simulationPassed: simulation.simulation.status,
  }))

  return {
    ...preHooksKeys.reduce((acc, key, index) => ({ ...acc, [key]: preHooksData[index] }), {}),
    ...postHooksKeys.reduce((acc, key, index) => ({ ...acc, [key]: postHooksData[index] }), {}),
  }
}
