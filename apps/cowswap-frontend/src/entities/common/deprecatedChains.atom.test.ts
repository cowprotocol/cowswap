import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { deprecatedChainsAtom } from './deprecatedChains.atom'

describe('deprecatedChainsAtom', () => {
  it('keeps Linea active while feature flags are not loaded', () => {
    const store = createStore()

    expect(store.get(deprecatedChainsAtom).has(SupportedChainId.LINEA)).toBe(false)
  })

  it('keeps Linea active when isLineaDeprecated is off', () => {
    const store = createStore()
    store.set(featureFlagsAtom, { isLineaDeprecated: false })

    expect(store.get(deprecatedChainsAtom).has(SupportedChainId.LINEA)).toBe(false)
  })

  it('deprecates Linea when isLineaDeprecated is on', () => {
    const store = createStore()
    store.set(featureFlagsAtom, { isLineaDeprecated: true })

    expect(store.get(deprecatedChainsAtom).has(SupportedChainId.LINEA)).toBe(true)
  })
})
