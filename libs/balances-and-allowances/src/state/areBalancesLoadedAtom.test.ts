import { createStore } from 'jotai'

import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { areBalancesLoadedAtom } from './areBalancesLoadedAtom'
import { balancesAtom, balancesUpdateAtom, DEFAULT_BALANCES_STATE } from './balancesAtom'
import { BalancesWatcherHealth, balancesWatcherHealthAtom } from './balancesWatcherHealthAtom'

const CHAIN_ID = SupportedChainId.MAINNET
const ACCOUNT = '0x00000000000000000000000000000000000000Ab'

function createLoadedStore(isRecovering: boolean): ReturnType<typeof createStore> {
  const store = createStore()

  store.set(balancesAtom, { ...DEFAULT_BALANCES_STATE, chainId: CHAIN_ID, hasFirstLoad: true })
  store.set(balancesWatcherHealthAtom, {
    status: isRecovering ? BalancesWatcherHealth.Fallback : BalancesWatcherHealth.Healthy,
    isRecovering,
  })

  return store
}

describe('areBalancesLoadedAtom', () => {
  it('is false before the first load', () => {
    expect(createStore().get(areBalancesLoadedAtom)).toBe(false)
  })

  it('is true once the watcher has loaded the balances', () => {
    expect(createLoadedStore(false).get(areBalancesLoadedAtom)).toBe(true)
  })

  it('is false while the watcher recovers and the multicall fallback has not fetched the balances yet', () => {
    expect(createLoadedStore(true).get(areBalancesLoadedAtom)).toBe(false)
  })

  it('is true while the watcher recovers once the multicall fallback has fetched the balances', () => {
    const store = createLoadedStore(true)

    store.set(balancesUpdateAtom, (state) => ({ ...state, [CHAIN_ID]: { [getAddressKey(ACCOUNT)]: Date.now() } }))

    expect(store.get(areBalancesLoadedAtom)).toBe(true)
  })
})
