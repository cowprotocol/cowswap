import { useCallback, useMemo } from 'react'

import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'

import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'

import { HooksStoreState } from './hookDetailsAtom'
import { useHooks } from './useHooks'

// Tenderly's simulation returns `gasUsed`, which is the gas the call would
// CONSUME on the happy path. Using that as the on-chain `gasLimit` (= the
// budget passed to the call) under-allocates for nested-call hooks like
// the CoW-Shed flow, because EIP-150's 63/64 rule and the per-frame
// reentrancy sentry both reserve gas that the consumed measurement does
// not surface. For ~14 nested levels the actual budget required is
// ~1.5–2x the consumed gas.
//
// We pad the simulated gasUsed by this factor before treating it as a
// budget, and take the max with whatever budget the hook dapp itself
// declared (the dapp may have its own informed estimate).
const GAS_LIMIT_SAFETY_NUMERATOR = 150n
const GAS_LIMIT_SAFETY_DENOMINATOR = 100n

function maxBigInt(a: bigint, b: bigint): bigint {
  return a > b ? a : b
}

export function useHooksStateWithSimulatedGas(): HooksStoreState {
  const hooksRaw = useHooks()
  const { data: tenderlyData } = useTenderlyBundleSimulation()

  const combineHookWithSimulatedGas = useCallback(
    (hook: CowHookDetails): CowHookDetails => {
      const hookTenderlyData = tenderlyData?.[hook.uuid]
      if (!hookTenderlyData?.gasUsed || hookTenderlyData.gasUsed === '0' || !hookTenderlyData.status) return hook

      const simulatedBudget =
        (BigInt(hookTenderlyData.gasUsed) * GAS_LIMIT_SAFETY_NUMERATOR) / GAS_LIMIT_SAFETY_DENOMINATOR
      const dappDeclaredBudget = (() => {
        try {
          return BigInt(hook.hook.gasLimit)
        } catch {
          return 0n
        }
      })()
      const gasLimit = maxBigInt(simulatedBudget, dappDeclaredBudget).toString()

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
