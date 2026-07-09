import { createStore } from 'jotai'

import { twapOrderSlippageAtom, updateTwapOrdersSettingsAtom } from './twapOrdersSettingsAtom'

describe('twapOrderSlippageAtom', () => {
  it('returns 1000 bps for default 10% slippage', () => {
    const store = createStore()
    const slippage = store.get(twapOrderSlippageAtom)

    expect(Number(slippage.numerator)).toBe(1000)
    expect(slippage.toFixed(2)).toBe('10.00')
  })

  it('converts custom percent input to bps', () => {
    const store = createStore()

    store.set(updateTwapOrdersSettingsAtom, { slippageValue: 10 })

    expect(Number(store.get(twapOrderSlippageAtom).numerator)).toBe(1000)
  })
})
