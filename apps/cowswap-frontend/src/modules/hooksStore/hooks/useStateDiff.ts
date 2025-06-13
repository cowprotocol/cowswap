import { useMemo } from 'react'

import { CowHookDetails, StateDiff } from '@cowprotocol/hook-dapp-lib'

import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'
import { SimulationData } from 'modules/tenderly/types'

import { useHooks } from './useHooks'

const EMPTY_STATE_DIFF: StateDiff[] = []

function getHookStateDiff(data: Record<string, SimulationData> | undefined, hooks: CowHookDetails[]) {
  if (!data || !hooks) return null

  const lastHook = hooks[hooks.length - 1]
  return data[lastHook?.uuid]?.stateDiff || null
}

export function useHookStateDiff(isPreHook: boolean, hookToEditUid?: string): StateDiff[] {
  const { data } = useTenderlyBundleSimulation()
  const { preHooks, postHooks } = useHooks()

  const preHookStateDiff = useMemo(() => getHookStateDiff(data, preHooks), [data, preHooks])
  const postHookStateDiff = useMemo(() => getHookStateDiff(data, postHooks), [data, postHooks])

  const hookToEditStateDiff = useMemo(() => {
    if (!data || !hookToEditUid) return null

    const otherHooks = isPreHook ? preHooks : postHooks

    const hookToEditIndex = otherHooks.findIndex((hook) => hook.uuid === hookToEditUid)

    // is editing first preHook -> return empty state
    if (!hookToEditIndex && isPreHook) return null

    // is editing first postHook -> return
    if (!hookToEditIndex && !isPreHook) return preHookStateDiff

    // is editing a non first hook, return the latest available hook state
    const previousHookIndex = hookToEditIndex - 1

    return data[otherHooks[previousHookIndex]?.uuid]?.stateDiff || null
  }, [data, hookToEditUid, isPreHook, preHooks, postHooks, preHookStateDiff])

  return useMemo(() => {
    if (hookToEditUid) return hookToEditStateDiff || EMPTY_STATE_DIFF
    if (isPreHook) return preHookStateDiff || EMPTY_STATE_DIFF
    return postHookStateDiff || preHookStateDiff || EMPTY_STATE_DIFF
  }, [hookToEditStateDiff, hookToEditUid, isPreHook, postHookStateDiff, preHookStateDiff])
}
