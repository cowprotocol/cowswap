import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { CowWidgetEvents, type OnTradeParamsPayload } from '@cowprotocol/events'
import { TradeType } from '@cowprotocol/widget-lib'

import { renderHook } from '@testing-library/react'

import { tradeTypeAtom } from './tradeTypeAtom'
import { useWidgetTradeTypeSync } from './useWidgetTradeTypeSync'

const STORAGE_KEY = 'rwaTradeType:v1'

// The stored tab is read when the atom is created, so a page load needs a fresh module registry
function loadStoredTradeType(storedTradeType: TradeType): TradeType {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storedTradeType))

  let tradeType: TradeType | undefined

  jest.isolateModules(() => {
    const jotai: typeof import('jotai') = require('jotai')
    const modules: typeof import('./tradeTypeAtom') = require('./tradeTypeAtom')

    tradeType = jotai.createStore().get(modules.tradeTypeAtom)
  })

  if (!tradeType) throw new Error('Trade type not loaded')

  return tradeType
}

function renderSync(): { store: ReturnType<typeof createStore>; emit: (orderType: string) => void } {
  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>
  const { result } = renderHook(() => useWidgetTradeTypeSync(), { wrapper })
  const [listener] = result.current

  if (listener.event !== CowWidgetEvents.ON_CHANGE_TRADE_PARAMS) throw new Error('Unexpected listener')

  return { store, emit: (orderType) => listener.handler({ orderType } as OnTradeParamsPayload) }
}

describe('useWidgetTradeTypeSync', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it.each([
    ['SWAP', TradeType.LIMIT, TradeType.SWAP],
    ['LIMIT', TradeType.SWAP, TradeType.LIMIT],
    ['TWAP', TradeType.SWAP, TradeType.ADVANCED],
  ])('remembers the %s tab', (orderType, previousTradeType, tradeType) => {
    const { store, emit } = renderSync()

    store.set(tradeTypeAtom, previousTradeType)
    emit(orderType)

    expect(store.get(tradeTypeAtom)).toBe(tradeType)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toBe(tradeType)
  })

  it('does not write the storage again for the same tab', () => {
    const { store, emit } = renderSync()

    store.set(tradeTypeAtom, TradeType.LIMIT)
    localStorage.clear()
    emit('LIMIT')

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('keeps the tab for an order type the app does not offer', () => {
    const { store, emit } = renderSync()

    emit('LIMIT')
    emit('YIELD')

    expect(store.get(tradeTypeAtom)).toBe(TradeType.LIMIT)
  })
})

describe('tradeTypeAtom', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reopens the stored tab on page load', () => {
    expect(loadStoredTradeType(TradeType.ADVANCED)).toBe(TradeType.ADVANCED)
  })

  it('opens Swap when the stored tab is not offered', () => {
    expect(loadStoredTradeType(TradeType.YIELD)).toBe(TradeType.SWAP)
  })
})
