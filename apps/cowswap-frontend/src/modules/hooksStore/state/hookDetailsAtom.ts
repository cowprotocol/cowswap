import { atom, SetStateAction } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'
import { walletInfoAtom } from '@cowprotocol/wallet'

export type HooksStoreState = {
  preHooks: CowHookDetails[]
  postHooks: CowHookDetails[]
}

type StatePerAccount = Record<string, HooksStoreState>
type StatePerNetwork = Record<SupportedChainId, StatePerAccount | undefined>

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

  return (state[chainId] && state[chainId][account]) || EMPTY_STATE
})

export const setHooksAtom = atom(null, (get, set, update: SetStateAction<HooksStoreState>) => {
  const { chainId, account = '' } = get(walletInfoAtom)

  set(hooksAtomInner, (state) => {
    return {
      ...state,
      [chainId]: {
        ...state[chainId],
        [account]:
          typeof update === 'function' ? update((state[chainId] && state[chainId][account]) || EMPTY_STATE) : update,
      },
    }
  })
})
