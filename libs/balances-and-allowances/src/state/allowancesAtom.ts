import { getRpcProvider } from '@cowprotocol/common-const'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ERC_20_INTERFACE } from '@cowprotocol/cowswap-abis'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { multiCall } from '@cowprotocol/multicall'
import { PersistentStateByChain } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'
import { atom } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
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
  if (!provider) return tokenAddresses.reduce<AllowancesState>((acc, a) => ({ ...acc, [a.toLowerCase()]: undefined }), {})

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
function tokenAllowancesFamilyKey(tokenAddresses: string[]): string {
  return JSON.stringify([...tokenAddresses].map((a) => a.toLowerCase()).sort())
}

/**
 * Atom family that fetches ERC20 allowances for the given token addresses.
 * Uses wallet account and chain from walletInfoAtom; spender is the protocol vault relayer.
 * Param is compared by sorted token list (value equality) so different array refs with same tokens reuse the same atom.
 * When no one is listening, the atom is removed from memory (setShouldRemove).
 */
export const tokenAllowancesLoadableAtomFamily = atomFamily(
  (tokenAddresses: string[]) => {
    const alowancesAtom = atom(async (get): Promise<AllowancesState | undefined> => {
      const { chainId, account } = get(walletInfoAtom)
      if (!tokenAddresses.length || !account || !chainId) return undefined

      const chainIdNum = typeof chainId === 'number' ? chainId : Number(chainId)
      if (!(chainIdNum in SupportedChainId)) return undefined

      const spender = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainIdNum as SupportedChainId]
      if (!spender) return undefined

      return fetchAllowances(chainIdNum as SupportedChainId, account, spender, tokenAddresses)
    })

    return loadable(alowancesAtom)
  },
  (a, b) => tokenAllowancesFamilyKey(a) === tokenAllowancesFamilyKey(b),
)

tokenAllowancesLoadableAtomFamily.setShouldRemove((createdAt, tokenAddresses) => {
  return true
})
