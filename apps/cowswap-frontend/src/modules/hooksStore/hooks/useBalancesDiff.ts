import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { BigNumber } from 'ethers'

import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'
import { BalancesDiff } from 'modules/tenderly/types'

import { useHooks } from './useHooks'
import { useOrderParams } from './useOrderParams'

const EMPTY_BALANCE_DIFF: BalancesDiff = {}

export function usePreHookBalanceDiff(): BalancesDiff {
  const { data } = useTenderlyBundleSimulation()

  const { preHooks } = useHooks()

  return useMemo(() => {
    if (!data || !preHooks.length) return EMPTY_BALANCE_DIFF

    const lastPreHook = preHooks[preHooks.length - 1]
    return data[lastPreHook?.uuid]?.cumulativeBalancesDiff || EMPTY_BALANCE_DIFF
  }, [data, preHooks])
}

// Returns all the ERC20 Balance Diff of the current hook to be passed to the iframe context
export function useHookBalancesDiff(isPreHook: boolean, hookToEditUid?: string): BalancesDiff {
  const { account } = useWalletInfo()
  const { data } = useTenderlyBundleSimulation()
  const orderParams = useOrderParams()
  const { preHooks, postHooks } = useHooks()
  const preHookBalanceDiff = usePreHookBalanceDiff()

  // balance diff expected from the order without the simulation
  // this is used when the order isn't simulated like in the case of only preHooks
  const orderExpectedBalanceDiff = useMemo(() => {
    if (!account) return EMPTY_BALANCE_DIFF
    const balanceDiff: Record<string, string> = {}

    if (orderParams?.buyAmount && orderParams.buyTokenAddress && account)
      balanceDiff[orderParams.buyTokenAddress.toLowerCase()] = orderParams.buyAmount

    if (orderParams?.sellAmount && orderParams.sellTokenAddress && account)
      balanceDiff[orderParams.sellTokenAddress.toLowerCase()] = `-${orderParams.sellAmount}`

    return { [account.toLowerCase()]: balanceDiff }
  }, [orderParams, account])

  const firstPostHookBalanceDiff = useMemo(() => {
    return mergeBalanceDiffs(preHookBalanceDiff, orderExpectedBalanceDiff)
  }, [preHookBalanceDiff, orderExpectedBalanceDiff])

  const postHookBalanceDiff = useMemo(() => {
    // is adding the first post hook or simulation not available
    if (!data || !postHooks) return firstPostHookBalanceDiff

    const lastPostHook = postHooks[postHooks.length - 1]
    return data[lastPostHook?.uuid]?.cumulativeBalancesDiff || firstPostHookBalanceDiff
  }, [data, firstPostHookBalanceDiff, postHooks])

  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  const hookToEditBalanceDiff = useMemo(() => {
    if (!data || !hookToEditUid) return EMPTY_BALANCE_DIFF

    const otherHooks = isPreHook ? preHooks : postHooks

    const hookToEditIndex = otherHooks.findIndex((hook) => hook.uuid === hookToEditUid)

    // is editing first preHook -> return empty state
    if (!hookToEditIndex && isPreHook) return EMPTY_BALANCE_DIFF

    // is editing first postHook -> return
    if (!hookToEditIndex && !isPreHook) return firstPostHookBalanceDiff

    // is editing a non first hook, return the latest available hook state
    const previousHookIndex = hookToEditIndex - 1

    return data[otherHooks[previousHookIndex]?.uuid]?.cumulativeBalancesDiff || EMPTY_BALANCE_DIFF
  }, [data, hookToEditUid, isPreHook, preHooks, postHooks, firstPostHookBalanceDiff])

  return useMemo(() => {
    if (hookToEditUid) return hookToEditBalanceDiff
    if (isPreHook) return preHookBalanceDiff
    return postHookBalanceDiff
  }, [hookToEditBalanceDiff, hookToEditUid, isPreHook, postHookBalanceDiff, preHookBalanceDiff])
}

function mergeBalanceDiffs(first: BalancesDiff, second: BalancesDiff): BalancesDiff {
  const result: BalancesDiff = {}

  // Helper function to add BigNumber strings

  // Process all addresses from first input
  for (const address of Object.keys(first)) {
    result[address] = { ...first[address] }
  }

  // Process all addresses from second input
  for (const address of Object.keys(second)) {
    if (!result[address]) {
      // If address doesn't exist in result, just copy the entire record
      result[address] = { ...second[address] }
    } else {
      // If address exists, we need to merge token balances
      for (const token of Object.keys(second[address])) {
        if (!result[address][token]) {
          // If token doesn't exist for this address, just copy the balance
          result[address][token] = second[address][token]
        } else {
          // If token exists, sum up the balances
          try {
            result[address][token] = BigNumber.from(result[address][token]).add(second[address][token]).toString()
          } catch (error) {
            console.error(`Error adding balances for address ${address} and token ${token}:`, error)
            throw error
          }
        }
      }
    }
  }

  return result
}
