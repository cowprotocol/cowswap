import { atom } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'

import { getRpcProvider } from '@cowprotocol/common-const'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ERC_20_INTERFACE } from '@cowprotocol/cowswap-abis'
import { multiCall } from '@cowprotocol/multicall'
import { PersistentStateByChain } from '@cowprotocol/types'
import { BigNumber } from '@ethersproject/bignumber'

import { atomFamily } from 'jotai-family'

export type AllowancesState = Record<string, BigNumber | undefined>

function buildAllowancesState(
  tokenAddresses: string[],
  decodedResults: (readonly [BigNumber] | undefined)[],
): AllowancesState {
  return tokenAddresses.reduce<AllowancesState>((acc, address, index) => {
    acc[address.toLowerCase()] = decodedResults[index]?.[0]
    return acc
  }, {})
}

async function fetchAllowances(
  chainId: SupportedChainId,
  account: string,
  spender: string,
  tokenAddresses: string[],
): Promise<AllowancesState> {
  const provider = getRpcProvider(chainId as number)
  if (!provider)
    return tokenAddresses.reduce<AllowancesState>((acc, a) => ({ ...acc, [a.toLowerCase()]: undefined }), {})

  const callData = ERC_20_INTERFACE.encodeFunctionData('allowance', [account, spender])
  const calls = tokenAddresses.map((address) => ({ target: address, callData }))

  const { results } = await multiCall(provider, calls, {})

  const decodedResults = results.map((result) => {
    try {
      return ERC_20_INTERFACE.decodeFunctionResult('allowance', result.returnData) as readonly [BigNumber]
    } catch {
      return undefined
    }
  })

  return buildAllowancesState(tokenAddresses, decodedResults)
}

export const allowancesAtom = atomWithStorage<PersistentStateByChain<Record<string, BigNumber | undefined>>>(
  'allowancesAtom:v1',
  mapSupportedNetworks({}),
  getJotaiMergerStorage(),
)

/** Stable key for atomFamily so [a,b] and [b,a] resolve to the same atom. */
function tokenAllowancesFamilyKey(params: TokenAllowancesFamilyParams): string {
  return [params.chainId, params.account, ...params.tokenAddresses.map((a) => a.toLowerCase()).sort()].join(',')
}

function areTokenAllowancesParamsEqual(a: TokenAllowancesFamilyParams, b: TokenAllowancesFamilyParams): boolean {
  return tokenAllowancesFamilyKey(a) === tokenAllowancesFamilyKey(b)
}

export interface TokenAllowancesFamilyParams {
  chainId: SupportedChainId
  account: string
  tokenAddresses: string[]
}

/**
 * Atom family that fetches ERC20 allowances for the given token addresses.
 * Uses wallet account and chain from walletInfoAtom; spender is the protocol vault relayer.
 * Param is compared by sorted token list (value equality) so different array refs with same tokens reuse the same atom.
 * When no one is listening, the atom is removed from memory (setShouldRemove).
 */
export const tokenAllowancesLoadableFamily = atomFamily(
  ({ chainId, account, tokenAddresses }: TokenAllowancesFamilyParams) => {
    const alowancesAtom = atom(async (): Promise<AllowancesState | undefined> => {
      const spender = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

      if (!chainId || !account || !spender || !tokenAddresses.length) return undefined

      // TODO: This can be improved by caching at the module-level, and only actually refetching if the previously fetched allowances
      // DO NOT include some of the requested tokens.
      return fetchAllowances(chainId, account, spender, tokenAddresses)
    })

    return loadable(alowancesAtom)
  },
  areTokenAllowancesParamsEqual,
)

tokenAllowancesLoadableFamily.setShouldRemove((createdAt, params) => {
  // Allowances expire after 10 minutes:
  if (Date.now() - createdAt > 10 * 60 * 1000) return true

  // Always remove all other allowances:
  for (const param of tokenAllowancesLoadableFamily.getParams()) {
    if (!areTokenAllowancesParamsEqual(param, params)) tokenAllowancesLoadableFamily.remove(param)
  }

  return false
})
