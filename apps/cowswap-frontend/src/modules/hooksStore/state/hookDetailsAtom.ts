import { atom, SetStateAction } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { CowHookDetails } from '@cowprotocol/hook-dapp-lib'
import { walletInfoAtom } from '@cowprotocol/wallet'

interface CowHookDetailsSerialized {
  hookDetails: CowHookDetails
  dappName: string
}

export type HooksStoreState = {
  preHooks: CowHookDetailsSerialized[]
  postHooks: CowHookDetailsSerialized[]
}

type StatePerAccount = Record<string, HooksStoreState>
type StatePerNetwork = Record<SupportedChainId, StatePerAccount>

const EMPTY_STATE: HooksStoreState = {
  preHooks: [],
  postHooks: [],
}

const hooksAtomInner = atomWithStorage<StatePerNetwork>(
  'hooksStoreAtom:v1',
  mapSupportedNetworks({}),
  getJotaiIsolatedStorage(),
)

export const hooksAtom = atom((get) => {
  const { chainId, account = '' } = get(walletInfoAtom)
  const state = get(hooksAtomInner)

  return state[chainId][account] || EMPTY_STATE
})

export const setHooksAtom = atom(null, (get, set, update: SetStateAction<HooksStoreState>) => {
  const { chainId, account = '' } = get(walletInfoAtom)

  set(hooksAtomInner, (state) => {
    return {
      ...state,
      [chainId]: {
        ...state[chainId],
        [account]: typeof update === 'function' ? update(state[chainId][account] || EMPTY_STATE) : update,
      },
    }
  })
})
