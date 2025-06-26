import { atom, SetStateAction } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'
import { PersistentStateByChain } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

export type HooksStoreState = {
  preHooks: CowHookDetails[]
  postHooks: CowHookDetails[]
}

type StatePerAccount = Record<string, HooksStoreState>
type StatePerNetwork = PersistentStateByChain<StatePerAccount>

const EMPTY_STATE: HooksStoreState = {
  preHooks: [],
  postHooks: [],
}

const hooksAtomInner = atomWithStorage<StatePerNetwork>(
  'hooksStoreAtom:v3',
  mapSupportedNetworks({}),
  getJotaiIsolatedStorage(),
)

export const hooksAtom = atom((get) => {
  const { chainId, account = '' } = get(walletInfoAtom)
  const state = get(hooksAtomInner)
  const stateForChain = state[chainId] || {}

  return stateForChain[account] || EMPTY_STATE
})

export const setHooksAtom = atom(null, (get, set, update: SetStateAction<HooksStoreState>) => {
  const { chainId, account = '' } = get(walletInfoAtom)

  set(hooksAtomInner, (state) => {
    const stateForChain = state[chainId] || {}

    return {
      ...state,
      [chainId]: {
        ...state[chainId],
        [account]: typeof update === 'function' ? update(stateForChain[account] || EMPTY_STATE) : update,
      },
    }
  })
})
