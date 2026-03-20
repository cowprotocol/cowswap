import { atomWithStorage } from 'jotai/utils'

import { getRpcProvider } from '@cowprotocol/common-const'
import { asyncAtomFamily, COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ERC_20_INTERFACE } from '@cowprotocol/cowswap-abis'
import { multiCall } from '@cowprotocol/multicall'
import { PersistentStateByChain } from '@cowprotocol/types'
import { BigNumber } from '@ethersproject/bignumber'

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

export const tokenAllowancesFamily = asyncAtomFamily(
  async (params: TokenAllowancesFamilyParams): Promise<AllowancesState | null> => {
    const { chainId, account, tokenAddresses } = params
    const spender = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

    if (!chainId || !account || !spender || !tokenAddresses.length) {
      return null
    }

    return fetchAllowances(chainId, account, spender, tokenAddresses)
  },
  {
    areEqual: areTokenAllowancesParamsEqual,
    familyLabel: 'tokenAllowancesFamily',
    valueOnError: {} as AllowancesState,
  },
)
