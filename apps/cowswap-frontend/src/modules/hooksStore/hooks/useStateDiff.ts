import { useMemo } from 'react'

import { StateDiff } from '@cowprotocol/hook-dapp-lib'

import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'

import { useHooks } from './useHooks'

const EMPTY_STATE_DIFF: StateDiff[] = []

export function useHookStateDiff(isPreHook: boolean, hookToEditUid?: string): StateDiff[] {
  const { data } = useTenderlyBundleSimulation()
  const { preHooks, postHooks } = useHooks()

  const preHookStateDiff = useMemo(() => {
    if (!data || !preHooks.length) return EMPTY_STATE_DIFF

    const lastPreHook = preHooks[preHooks.length - 1]
    return data[lastPreHook?.uuid]?.stateDiff || EMPTY_STATE_DIFF
  }, [data, preHooks])

  const postHookBalanceDiff = useMemo(() => {
    // is adding the first post hook or simulation not available
    if (!data || !postHooks) return preHookStateDiff

    const lastPostHook = postHooks[postHooks.length - 1]
    return data[lastPostHook?.uuid]?.stateDiff || preHookStateDiff
  }, [data, preHookStateDiff, postHooks])

  const hookToEditBalanceDiff = useMemo(() => {
    if (!data || !hookToEditUid) return EMPTY_STATE_DIFF

    const otherHooks = isPreHook ? preHooks : postHooks

    const hookToEditIndex = otherHooks.findIndex((hook) => hook.uuid === hookToEditUid)

    // is editing first preHook -> return empty state
    if (!hookToEditIndex && isPreHook) return EMPTY_STATE_DIFF

    // is editing first postHook -> return
    if (!hookToEditIndex && !isPreHook) return preHookStateDiff

    // is editing a non first hook, return the latest available hook state
    const previousHookIndex = hookToEditIndex - 1

    return data[otherHooks[previousHookIndex]?.uuid]?.stateDiff || EMPTY_STATE_DIFF
  }, [data, hookToEditUid, isPreHook, preHooks, postHooks, preHookStateDiff])

  return useMemo(() => {
    if (hookToEditUid) return hookToEditBalanceDiff
    if (isPreHook) return preHookStateDiff
    return postHookBalanceDiff
  }, [hookToEditBalanceDiff, hookToEditUid, isPreHook, postHookBalanceDiff, preHookStateDiff])
}
