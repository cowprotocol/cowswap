import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'
import { useOrderParams } from './useOrderParams'
import { useHooks } from './useHooks'
import { useMemo } from 'react'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'
import { BalancesDiff } from 'modules/tenderly/types'
import { BigNumber } from 'ethers'

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
export function useHookBalancesDiff(isPreHook: boolean, hookToEditDetails?: CowHookDetails): BalancesDiff {
  const { account } = useWalletInfo()
  const { data } = useTenderlyBundleSimulation()
  const orderParams = useOrderParams()
  const { preHooks, postHooks } = useHooks()
  const preHookBalanceDiff = usePreHookBalanceDiff()

  const orderMockBalanceDiff = useMemo(() => {
    if (!account) return EMPTY_BALANCE_DIFF
    const balanceDiff: Record<string, string> = {}

    if (orderParams?.buyAmount && orderParams.buyTokenAddress && account)
      balanceDiff[orderParams.buyTokenAddress] = orderParams.buyAmount

    if (orderParams?.sellAmount && orderParams.sellTokenAddress && account)
      balanceDiff[orderParams.sellTokenAddress] = `-${orderParams.sellAmount}`

    return { account: balanceDiff }
  }, [orderParams, account])

  const firstPostHookBalanceDiff = useMemo(() => {
    return mergeBalanceDiffs(preHookBalanceDiff, orderMockBalanceDiff)
  }, [preHookBalanceDiff, orderMockBalanceDiff])

  const postHookBalanceDiff = useMemo(() => {
    // is adding the first post hook or simulation not available
    if (!data || !postHooks) return firstPostHookBalanceDiff

    const lastPostHook = postHooks[postHooks.length - 1]
    return data[lastPostHook?.uuid]?.cumulativeBalancesDiff || firstPostHookBalanceDiff
  }, [data, postHooks, orderMockBalanceDiff, preHookBalanceDiff])

  const hookToEditBalanceDiff = useMemo(() => {
    if (!data || !hookToEditDetails?.uuid) return EMPTY_BALANCE_DIFF

    const otherHooks = isPreHook ? preHooks : postHooks

    const hookToEditIndex = otherHooks.findIndex((hook) => hook.uuid === hookToEditDetails.uuid)

    // is editing first preHook -> return empty state
    if (!hookToEditIndex && isPreHook) return EMPTY_BALANCE_DIFF

    // is editing first postHook -> return
    if (!hookToEditIndex && !isPreHook) return firstPostHookBalanceDiff

    // is editing a non first hook, return the latest available hook state
    const previousHookIndex = hookToEditIndex - 1

    return data[otherHooks[previousHookIndex]?.uuid]?.cumulativeBalancesDiff || EMPTY_BALANCE_DIFF
  }, [data, hookToEditDetails])

  return useMemo(() => {
    if (hookToEditDetails?.uuid) return hookToEditBalanceDiff
    if (isPreHook) return preHookBalanceDiff
    return postHookBalanceDiff
  }, [data, orderParams, preHooks, postHooks])
}

function mergeBalanceDiffs(
  first: Record<string, Record<string, string>>,
  second: Record<string, Record<string, string>>,
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {}

  // Helper function to add BigNumber strings
  const addBigNumberStrings = (a: string, b: string): string => {
    const bigA = BigNumber.from(a)
    const bigB = BigNumber.from(b)
    return bigA.add(bigB).toString()
  }

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
            result[address][token] = addBigNumberStrings(result[address][token], second[address][token])
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
