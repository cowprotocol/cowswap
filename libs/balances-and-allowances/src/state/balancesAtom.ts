import { atomWithReset, atomWithStorage } from 'jotai/utils'

import { getJotaiMergerStorage } from '@cowprotocol/core'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import { Erc20MulticallState } from '../types'

type BalancesCache = PersistentStateByChain<Record<string, string>>

export interface BalancesState extends Erc20MulticallState {}

export const balancesCacheAtom = atomWithStorage<BalancesCache>(
  'balancesCacheAtom:v0',
  mapSupportedNetworks({}),
  getJotaiMergerStorage(),
)

export const balancesAtom = atomWithReset<BalancesState>({ isLoading: false, values: {} })
