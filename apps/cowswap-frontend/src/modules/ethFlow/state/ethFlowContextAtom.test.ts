import { createStore } from 'jotai'

import { isEthFlowWalletActionPendingAtom, updateEthFlowContextAtom } from './ethFlowContextAtom'

describe('isEthFlowWalletActionPendingAtom', () => {
  it('is false while no ETH-flow action awaits the wallet', () => {
    const store = createStore()

    expect(store.get(isEthFlowWalletActionPendingAtom)).toBe(false)
  })

  it.each(['wrap', 'approve'] as const)('is true while the %s awaits the wallet', (type) => {
    const store = createStore()

    store.set(updateEthFlowContextAtom, { [type]: { inProgress: true } })
    expect(store.get(isEthFlowWalletActionPendingAtom)).toBe(true)

    store.set(updateEthFlowContextAtom, { [type]: { inProgress: false } })
    expect(store.get(isEthFlowWalletActionPendingAtom)).toBe(false)
  })
})
