import { decodeFunctionData, type Hex, parseAbi, toFunctionSelector } from 'viem'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { getAppDataHooks } from 'modules/appData'

const EXECUTE_HOOKS_SIGNATURE =
  'function executeHooks((address target, uint256 value, bytes callData, bool allowFailure, bool isDelegateCall)[] calls, bytes32 nonce, uint256 deadline, address user, bytes signature)'

const COW_SHED_FACTORY_ABI = parseAbi([EXECUTE_HOOKS_SIGNATURE])

const EXECUTE_HOOKS_SELECTOR = toFunctionSelector(EXECUTE_HOOKS_SIGNATURE)

/**
 * Returns the `user` of a CoW Shed `executeHooks` hook signed for an account other than the order owner.
 * Matches by selector rather than factory address, so every CoW Shed version is covered.
 */
export function findForeignCowShedHookUser(fullAppData: string, owner: string): string | undefined {
  const hooks = getAppDataHooks(fullAppData)

  return [...(hooks?.pre ?? []), ...(hooks?.post ?? [])]
    .map(({ callData }) => getCowShedHookUser(callData))
    .find((user) => !!user && !areAddressesEqual(user, owner))
}

function getCowShedHookUser(callData: string): string | undefined {
  if (!callData.toLowerCase().startsWith(EXECUTE_HOOKS_SELECTOR)) return undefined

  try {
    const { args } = decodeFunctionData({ abi: COW_SHED_FACTORY_ABI, data: callData as Hex })

    return args[3]
  } catch {
    return undefined
  }
}
