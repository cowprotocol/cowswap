import { useMemo } from 'react'

import { useTenderlyBundleSimulation } from './useTenderlyBundleSimulation'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSimulationData(hookUuid?: string) {
  const { data } = useTenderlyBundleSimulation()

  return useMemo(() => {
    if (!data || !hookUuid) return
    return data[hookUuid]
  }, [data, hookUuid])
}
