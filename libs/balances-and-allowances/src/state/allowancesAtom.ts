import { atom } from 'jotai'

import { erc20Abi, type Address } from 'viem'
import { Connector } from 'wagmi'

import { asyncAtomFamily, getPublicClientFromProvider } from '@cowprotocol/common-utils'
import { getAddressKey, mapSupportedNetworks, SupportedChainId, EvmChains, isEvmChain } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import ms from 'ms.macro'

export type AllowancesState = Record<string, bigint | undefined>

function buildAllowancesState(tokenAddresses: string[], decodedResults: (bigint | undefined)[]): AllowancesState {
  return tokenAddresses.reduce<AllowancesState>((acc, address, index) => {
    acc[getAddressKey(address)] = decodedResults[index]
    return acc
  }, {})
}

async function fetchAllowances(
  connector: Connector,
  chainId: EvmChains,
  account: string,
  spender: string,
  tokenAddresses: string[],
): Promise<AllowancesState> {
  const provider = await connector.getProvider({ chainId }).catch(() => undefined)

  // If the connector does not expose an EIP-1193, or provider retrieval fails (which can happen during page load),
  // fallback to default RPC (getClient takes care of that internally):
  const client = getPublicClientFromProvider(chainId, provider)

  const results = await client.multicall({
    allowFailure: true,
    contracts: tokenAddresses.map((address) => ({
      address: address as Address,
      abi: erc20Abi,
      functionName: 'allowance' as const,
      args: [account as Address, spender as Address],
    })),
  })

  const decodedResults = results.map((result) => (result.status === 'success' ? result.result : undefined))

  return buildAllowancesState(tokenAddresses, decodedResults)
}

// In-memory only: values are `bigint` (SPL delegations / EVM allowances), which `JSON.stringify` cannot
// serialize — persisting via `atomWithStorage` throws on write. Delegations are re-fetched each session
// by `usePersistSplDataMulticall`, so persistence is unnecessary here.
export const allowancesAtom = atom<PersistentStateByChain<Record<string, bigint | undefined>>>(mapSupportedNetworks({}))

export interface TokenAllowancesFamilyParams {
  connector?: Connector
  chainId: SupportedChainId
  account?: string
  spender?: string
  tokenAddresses: string[]
}

function areTokenAllowancesParamsEqual(a: TokenAllowancesFamilyParams, b: TokenAllowancesFamilyParams): boolean {
  return tokenAllowancesFamilyKey(a) === tokenAllowancesFamilyKey(b)
}

/** Stable key for atomFamily so [a,b] and [b,a] resolve to the same atom. */
function tokenAllowancesFamilyKey(params: TokenAllowancesFamilyParams): string {
  return [
    params.chainId,
    getAddressKey(params.account ?? ''),
    getAddressKey(params.spender ?? ''),
    ...params.tokenAddresses.map((a) => getAddressKey(a)).sort(),
  ].join(',')
}

// TODO: Combine apps/cowswap-frontend/src/common/hooks/useTokenAllowance.ts and optimisticAllowancesAtom
// in here. We should use a module to cache a Map of allowances per chain/token/owner/spender.

export const tokenAllowancesFamily = asyncAtomFamily(
  async (params: TokenAllowancesFamilyParams): Promise<AllowancesState | null> => {
    const { connector, chainId, account, spender, tokenAddresses } = params

    if (!connector || !chainId || !account || !spender || !tokenAddresses.length || !isEvmChain(chainId)) {
      return null
    }

    return fetchAllowances(connector, chainId, account, spender, tokenAddresses)
  },
  {
    areEqual: areTokenAllowancesParamsEqual,
    familyLabel: 'tokenAllowancesFamily',
    valueOnError: {} as AllowancesState,
    refetchInterval: ms`32s`,
  },
)

// TODO: Family clean up missing...
