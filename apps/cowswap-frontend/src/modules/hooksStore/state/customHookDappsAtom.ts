import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { setHooksAtom } from './hookDetailsAtom'

import { HookDappIframe } from '../types/hooks'
import { getHookDappId } from '../utils'

type CustomHookDapps = Record<HookDappIframe['url'], HookDappIframe>

type CustomHooksState = {
  pre: CustomHookDapps
  post: CustomHookDapps
}

const EMPTY_STATE: CustomHooksState = { pre: {}, post: {} }

const customHookDappsInner = atomWithStorage<Record<SupportedChainId, CustomHooksState>>(
  'customHookDappsAtom:v1',
  mapSupportedNetworks(EMPTY_STATE),
  getJotaiIsolatedStorage(),
)

export const customHookDappsAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const state = get(customHookDappsInner)

  return state[chainId] || EMPTY_STATE
})

export const customPreHookDappsAtom = atom((get) => {
  return Object.values(get(customHookDappsAtom).pre) as HookDappIframe[]
})

export const customPostHookDappsAtom = atom((get) => {
  return Object.values(get(customHookDappsAtom).post) as HookDappIframe[]
})

export const addCustomHookDappAtom = atom(null, (get, set, isPreHook: boolean, dapp: HookDappIframe) => {
  const { chainId } = get(walletInfoAtom)
  const state = get(customHookDappsInner)

  set(customHookDappsInner, {
    ...state,
    [chainId]: {
      ...state[chainId],
      [isPreHook ? 'pre' : 'post']: {
        ...state[chainId][isPreHook ? 'pre' : 'post'],
        [dapp.url]: dapp,
      },
    },
  })
})

export const removeCustomHookDappAtom = atom(null, (get, set, dapp: HookDappIframe) => {
  const { chainId } = get(walletInfoAtom)
  const state = get(customHookDappsInner)
  const currentState = { ...state[chainId] }

  delete currentState.pre[dapp.url]
  delete currentState.post[dapp.url]

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
