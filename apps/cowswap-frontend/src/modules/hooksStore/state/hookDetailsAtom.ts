import { atom, SetStateAction } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowHookDetailsSerialized } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

type HooksStoreState = {
  preHooks: CowHookDetailsSerialized[]
  postHooks: CowHookDetailsSerialized[]
}

const hooksAtomInner = atomWithStorage<Record<SupportedChainId, HooksStoreState>>(
  'hooksStoreAtom:v0',
  mapSupportedNetworks({
    preHooks: [],
    postHooks: [],
  }),
  getJotaiIsolatedStorage(),
)

export const hooksAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const state = get(hooksAtomInner)

  return state[chainId]
})

export const setHooksAtom = atom(null, (get, set, update: SetStateAction<HooksStoreState>) => {
  const { chainId } = get(walletInfoAtom)

  set(hooksAtomInner, (state) => ({
    ...state,
    [chainId]: typeof update === 'function' ? update(state[chainId]) : update,
  }))
})
