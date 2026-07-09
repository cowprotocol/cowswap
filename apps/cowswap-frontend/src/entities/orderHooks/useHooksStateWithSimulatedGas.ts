import { useCallback, useMemo } from 'react'

import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'

import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'

import { HooksStoreState } from './hookDetailsAtom'
import { useHooks } from './useHooks'

// Tenderly's `gasUsed` is the gas CONSUMED on the happy path. As an on-chain
// `gasLimit` (= the budget the trampoline forwards), it under-allocates for
// nested-call hooks because EIP-150's 63/64 rule and the per-frame reentrancy
// sentry both reserve gas that `gasUsed` does not surface. The CoW-Shed flow
// has ~14 nested CALLs and needs ~1.5x the consumed gas as budget. Expressed
// as percent (bigint can't multiply by a fractional factor directly).
const GAS_LIMIT_SAFETY_FACTOR_PCT = 150n

export function useHooksStateWithSimulatedGas(): HooksStoreState {
  const hooksRaw = useHooks()
  const { data: tenderlyData } = useTenderlyBundleSimulation()

  const combineHookWithSimulatedGas = useCallback(
    (hook: CowHookDetails): CowHookDetails => {
      const hookTenderlyData = tenderlyData?.[hook.uuid]
      if (!hookTenderlyData?.gasUsed || hookTenderlyData.gasUsed === '0' || !hookTenderlyData.status) return hook

      // Take max() with whatever the dapp itself declared, so dapps with state
      // the simulation can't see (e.g. first-time COWShed proxy deploy) still
      // get through.
      const paddedSimulatedBudget = (BigInt(hookTenderlyData.gasUsed) * GAS_LIMIT_SAFETY_FACTOR_PCT) / 100n
      const dappBudget = hook.hook.gasLimit ? BigInt(hook.hook.gasLimit) : 0n
      const gasLimit = (paddedSimulatedBudget > dappBudget ? paddedSimulatedBudget : dappBudget).toString()

      return { ...hook, hook: { ...hook.hook, gasLimit } }
    },
    [tenderlyData],
  )

  return useMemo(() => {
    const preHooksCombined = hooksRaw.preHooks.map(combineHookWithSimulatedGas)
    const postHooksCombined = hooksRaw.postHooks.map(combineHookWithSimulatedGas)
    return { preHooks: preHooksCombined, postHooks: postHooksCombined }
  }, [hooksRaw, combineHookWithSimulatedGas])
}
