import { useCallback, useMemo } from 'react'

import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'

import { BigNumber } from 'ethers'

import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'

import { useHooks } from './useHooks'

import { HooksStoreState } from '../state/hookDetailsAtom'

export function useHooksStateWithSimulatedGas(): HooksStoreState {
  const hooksRaw = useHooks()
  const { data: tenderlyData } = useTenderlyBundleSimulation()

  const combineHookWithSimulatedGas = useCallback(
    (hook: CowHookDetails): CowHookDetails => {
      const simulatedGasUsed = tenderlyData?.[hook.uuid]?.gasUsed
      if (!simulatedGasUsed || simulatedGasUsed === '0') return hook
      const gasLimit = BigNumber.from(simulatedGasUsed).mul(110).div(100).toString() // 10% buffer
      const hookData = { ...hook.hook, gasLimit }
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
