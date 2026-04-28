import { atomWithStorage } from 'jotai/utils'

import { VIEM_CHAINS } from '@cowprotocol/common-const'
import { asyncAtomFamily } from '@cowprotocol/common-utils'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { getAddressKey, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'
import { isEip1193Provider } from '@cowprotocol/wallet'

import { createPublicClient, custom, erc20Abi, type Address } from 'viem'
import { Connector } from 'wagmi'

export type AllowancesState = Record<string, bigint | undefined>

function buildAllowancesState(tokenAddresses: string[], decodedResults: (bigint | undefined)[]): AllowancesState {
  return tokenAddresses.reduce<AllowancesState>((acc, address, index) => {
    acc[getAddressKey(address)] = decodedResults[index]
    return acc
  }, {})
}

async function fetchAllowances(
  connector: Connector,
  chainId: SupportedChainId,
  account: string,
  spender: string,
  tokenAddresses: string[],
): Promise<AllowancesState> {
  const provider = await connector.getProvider({ chainId })

  if (!isEip1193Provider(provider)) {
    return tokenAddresses.reduce<AllowancesState>((acc, a) => ({ ...acc, [getAddressKey(a)]: undefined }), {})
  }

  const chain = VIEM_CHAINS[chainId]
  const client = createPublicClient({
    chain,
    transport: custom(provider),
  })

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

export const allowancesAtom = atomWithStorage<PersistentStateByChain<Record<string, bigint | undefined>>>(
  'allowancesAtom:v1',
  mapSupportedNetworks({}),
  getJotaiMergerStorage(),
)

/** Stable key for atomFamily so [a,b] and [b,a] resolve to the same atom. */
function tokenAllowancesFamilyKey(params: TokenAllowancesFamilyParams): string {
  return [
    params.chainId,
    getAddressKey(params.account ?? ''),
    ...params.tokenAddresses.map((a) => getAddressKey(a)).sort(),
  ].join(',')
}

function areTokenAllowancesParamsEqual(a: TokenAllowancesFamilyParams, b: TokenAllowancesFamilyParams): boolean {
  return tokenAllowancesFamilyKey(a) === tokenAllowancesFamilyKey(b)
}

export interface TokenAllowancesFamilyParams {
  connector?: Connector
  chainId: SupportedChainId
  account?: string
  spender?: string
  tokenAddresses: string[]
}

export const tokenAllowancesFamily = asyncAtomFamily(
  async (params: TokenAllowancesFamilyParams): Promise<AllowancesState | null> => {
    const { connector, chainId, account, spender, tokenAddresses } = params

    if (!connector || !chainId || !account || !spender || !tokenAddresses.length) {
      return null
    }

    return fetchAllowances(connector, chainId, account, spender, tokenAddresses)
  },
  {
    areEqual: areTokenAllowancesParamsEqual,
    familyLabel: 'tokenAllowancesFamily',
    valueOnError: {} as AllowancesState,
  },
)
