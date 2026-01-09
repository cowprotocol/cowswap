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
  fromCache: boolean
  hasFirstLoad: boolean
  error: string | null
}

export const DEFAULT_BALANCES_STATE: BalancesState = {
  isLoading: false,
  values: {},
  chainId: null,
  fromCache: false,
  hasFirstLoad: false,
  error: null,
}

export const balancesCacheAtom = atomWithStorage<BalancesCache>(
  'balancesCacheAtom:v1',
  mapSupportedNetworks({}),
  getJotaiMergerStorage(),
)

export const balancesAtom = atomWithReset<BalancesState>(DEFAULT_BALANCES_STATE)

export const balancesUpdateAtom = atom<PersistentStateByChain<Record<string, number | undefined>>>(
  mapSupportedNetworks({}),
)
