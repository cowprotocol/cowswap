import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { setHooksAtom } from './hookDetailsAtom'

import { HookDappIframe } from '../types/hooks'
import { getHookDappId } from '../utils'

type CustomHookDapps = Record<HookDappIframe['url'], HookDappIframe>

const EMPTY_STATE: CustomHookDapps = {}

const customHookDappsInner = atomWithStorage<Record<SupportedChainId, CustomHookDapps>>(
  'customHookDappsAtom:v1',
  mapSupportedNetworks({}),
  getJotaiIsolatedStorage(),
)

export const customHookDappsAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const state = get(customHookDappsInner)

  return Object.values(state[chainId] || EMPTY_STATE) as HookDappIframe[]
})

export const addCustomHookDappAtom = atom(null, (get, set, dapp: HookDappIframe) => {
  const { chainId } = get(walletInfoAtom)
  const state = get(customHookDappsInner)

  set(customHookDappsInner, {
    ...state,
    [chainId]: {
      ...state[chainId],
      [dapp.url]: dapp,
    },
  })
})

export const removeCustomHookDappAtom = atom(null, (get, set, dapp: HookDappIframe) => {
  const { chainId } = get(walletInfoAtom)
  const state = get(customHookDappsInner)
  const currentState = { ...state[chainId] }

  delete currentState[dapp.url]

  set(customHookDappsInner, {
    ...state,
    [chainId]: currentState,
  })

  const hookDappId = getHookDappId(dapp)

  // Delete applied hooks along with the deleting hook-dapp
  set(setHooksAtom, (hooksState) => ({
    preHooks: (hooksState.preHooks || []).filter((hook) => hook.dappId !== hookDappId),
    postHooks: (hooksState.postHooks || []).filter((hook) => hook.dappId !== hookDappId),
  }))
})
