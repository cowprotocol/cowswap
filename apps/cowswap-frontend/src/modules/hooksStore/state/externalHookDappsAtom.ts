import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { setHooksAtom } from './hookDetailsAtom'

import { HookDappIframe } from '../types/hooks'
import { getHookDappId } from '../utils'

type ExternalHookDapps = Record<HookDappIframe['url'], HookDappIframe>

const EMPTY_STATE: ExternalHookDapps = {}

const externalHookDappsInner = atomWithStorage<Record<SupportedChainId, ExternalHookDapps>>(
  'externalHookDappsAtom:v1',
  mapSupportedNetworks({}),
  getJotaiIsolatedStorage(),
)

export const externalHookDappsAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const state = get(externalHookDappsInner)

  return Object.values(state[chainId] || EMPTY_STATE) as HookDappIframe[]
})

export const addExternalHookDappsAtom = atom(null, (get, set, dapp: HookDappIframe) => {
  const { chainId } = get(walletInfoAtom)
  const state = get(externalHookDappsInner)
  const customDapp = { ...dapp, isCustom: true }

  set(externalHookDappsInner, {
    ...state,
    [chainId]: {
      ...state[chainId],
      [customDapp.url]: customDapp,
    },
  })
})

export const removeExternalHookDappsAtom = atom(null, (get, set, dapp: HookDappIframe) => {
  const { chainId } = get(walletInfoAtom)
  const state = get(externalHookDappsInner)
  const currentState = { ...state[chainId] }

  delete currentState[dapp.url]

  set(externalHookDappsInner, {
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
