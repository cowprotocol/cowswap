import { useMemo } from 'react'

import { useTenderlyBundleSimulation } from './useTenderlyBundleSimulation'

export function useSimulationData(hookUuid?: string) {
  const { data } = useTenderlyBundleSimulation()

  return useMemo(() => {
    if (!data || !hookUuid) return
    return data[hookUuid]
  }, [data, hookUuid])
}
