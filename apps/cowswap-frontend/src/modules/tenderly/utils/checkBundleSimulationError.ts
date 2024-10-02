import { SimulationError, TenderlyBundleSimulationResponse } from '../types'

export function checkBundleSimulationError(
  response: TenderlyBundleSimulationResponse | SimulationError,
): response is SimulationError {
  return (response as SimulationError).error !== undefined
}
