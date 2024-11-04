import { PostBundleSimulationParams } from './bundleSimulation'

import { BalancesDiff, SimulationData } from '../types'

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

function convertBalanceDiffToLowerCaseKeys(data: BalancesDiff): BalancesDiff {
  console.log({ oi: 'oiiiii', data })
  return Object.entries(data).reduce((acc, [outerKey, innerObj]) => {
    const lowerOuterKey = outerKey.toLowerCase()
    console.log({ lowerOuterKey, innerObj })

    const processedInnerObj = Object.entries(innerObj || {}).reduce((innerAcc, [innerKey, value]) => {
      const lowerInnerKey = innerKey.toLowerCase()
      return {
        ...innerAcc,
        [lowerInnerKey]: value,
      }
    }, {})

    return {
      ...acc,
      [lowerOuterKey]: processedInnerObj,
    }
  }, {})
}

export function generateNewSimulationData(
  simulationData: SimulationData[],
  postParams: Pick<PostBundleSimulationParams, 'preHooks' | 'postHooks'>,
): Record<string, SimulationData> {
  console.log({ simulationData, postParams })
  const preHooksKeys = postParams.preHooks.map((hookDetails) => hookDetails.uuid)
  const postHooksKeys = postParams.postHooks.map((hookDetails) => hookDetails.uuid)

  const simulationDataWithLowerCaseBalanceDiffKeys = simulationData.map((data) => ({
    ...data,
    cumulativeBalancesDiff: convertBalanceDiffToLowerCaseKeys(data.cumulativeBalancesDiff),
  }))

  const preHooksData = simulationDataWithLowerCaseBalanceDiffKeys.slice(0, preHooksKeys.length)

  const postHooksData = simulationDataWithLowerCaseBalanceDiffKeys.slice(-postHooksKeys.length)

  return {
    ...preHooksKeys.reduce((acc, key, index) => ({ ...acc, [key]: preHooksData[index] }), {}),
    ...postHooksKeys.reduce((acc, key, index) => ({ ...acc, [key]: postHooksData[index] }), {}),
  }
}
