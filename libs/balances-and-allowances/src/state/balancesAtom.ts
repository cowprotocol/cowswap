import { atom } from 'jotai'
import { atomWithReset, atomWithStorage } from 'jotai/utils'

import { getJotaiMergerStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import { Erc20MulticallState } from '../types'

type Account = string
type TokenAddress = string

type BalancesCache = PersistentStateByChain<Record<Account, Record<TokenAddress, string>>>

export interface BalancesState extends Erc20MulticallState {
  chainId: SupportedChainId | null
}

export const balancesCacheAtom = atomWithStorage<BalancesCache>(
  'balancesCacheAtom:v1',
  mapSupportedNetworks({}),
  getJotaiMergerStorage(),
)

export const balancesAtom = atomWithReset<BalancesState>({
  isLoading: false,
  values: {},
  chainId: null,
})

export const balancesUpdateAtom = atom<PersistentStateByChain<Record<string, number | undefined>>>(
  mapSupportedNetworks({}),
)
