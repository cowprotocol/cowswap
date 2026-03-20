import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

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

export const tokenAllowancesFamily = atomFamily((params: TokenAllowancesFamilyParams) => {
  const tokenAllowancesAtom = atom<AllowancesState | null>(null)

  tokenAllowancesAtom.onMount = (set) => {
    const { chainId, account, tokenAddresses } = params
    const spender = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

    const totalFamilyMembers = tokenAllowancesFamily.length

    if (totalFamilyMembers > 10) {
      console.warn('Possible memory leak detected in tokenAllowancesFamily')
    }

    if (!chainId || !account || !spender || !tokenAddresses.length) {
      return () => {
        tokenAllowancesFamily.remove(params)
      }
    }

    let cancelled = false

    fetchAllowances(chainId, account, spender, tokenAddresses)
      .then((result) => {
        if (cancelled) return

        set(result)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        console.error('[tokenAllowancesFamily] error:', err)

        set({})
      })

    return () => {
      cancelled = true
      tokenAllowancesFamily.remove(params)
    }
  }

  return tokenAllowancesAtom
}, areTokenAllowancesParamsEqual)

// Why are we doing the cleanup using `onMount` instead of `setShouldRemove`?
// Well, `setShouldRemove` runs immediately and when you are about to get an
// atom from the cache. Internally, atomFamily is just a Map whose key is a
// param and whose value is an atom config. Unless you explicitly remove unused
// params, this leads to memory leaks. This is crucial if you use infinite
// number of params.
