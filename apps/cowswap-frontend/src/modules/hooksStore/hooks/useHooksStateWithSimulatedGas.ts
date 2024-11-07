import { useCallback, useMemo } from 'react'

import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'

import { BigNumber } from 'ethers'

import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'

import { useHooks } from './useHooks'

import { HooksStoreState } from '../state/hookDetailsAtom'

const GAS_BUFFER_PERCENTAGE = 110 // 10% buffer

export function useHooksStateWithSimulatedGas(): HooksStoreState {
  const hooksRaw = useHooks()
  const { data: tenderlyData } = useTenderlyBundleSimulation()

  const combineHookWithSimulatedGas = useCallback(
    (hook: CowHookDetails): CowHookDetails => {
      const simulatedGasUsed = tenderlyData?.[hook.uuid]?.gasUsed
      if (!simulatedGasUsed || simulatedGasUsed === '0') return hook
      const gasLimit = BigNumber.from(simulatedGasUsed).mul(GAS_BUFFER_PERCENTAGE).div(100).toString()
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
