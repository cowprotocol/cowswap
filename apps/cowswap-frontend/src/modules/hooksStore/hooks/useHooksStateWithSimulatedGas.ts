import { useCallback, useMemo } from 'react'

import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'

import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'

import { useHooks } from './useHooks'

import { HooksStoreState } from '../state/hookDetailsAtom'

export function useHooksStateWithSimulatedGas(): HooksStoreState {
  const hooksRaw = useHooks()
  const { data: tenderlyData } = useTenderlyBundleSimulation()

  const combineHookWithSimulatedGas = useCallback(
    (hook: CowHookDetails): CowHookDetails => {
      const hookTenderlyData = tenderlyData?.[hook.uuid]
      if (!hookTenderlyData?.gasUsed || hookTenderlyData.gasUsed === '0' || !hookTenderlyData.status) return hook
      const hookData = { ...hook.hook, gasLimit: hookTenderlyData.gasUsed }
      return { ...hook, hook: hookData }
    },
    [tenderlyData],
  )

  return useMemo(() => {
    const preHooksCombined = hooksRaw.preHooks.map(combineHookWithSimulatedGas)
    const postHooksCombined = hooksRaw.postHooks.map(combineHookWithSimulatedGas)
    return { preHooks: preHooksCombined, postHooks: postHooksCombined }
  }, [hooksRaw, combineHookWithSimulatedGas])
}
