import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { type CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-lib'

import { renderHook } from '@testing-library/react'

import { tradeTypeAtom } from './tradeTypeAtom'
import { useWidgetParamsTradeType } from './useWidgetParamsTradeType'

function buildParams(chainId: number): CowSwapWidgetParams {
  return { appCode: 'CoW RWA', chainId, sell: { asset: 'USDC', amount: '1000' } }
}

function renderParams(): {
  store: ReturnType<typeof createStore>
  rerender: (params: CowSwapWidgetParams | null) => void
  result: { current: CowSwapWidgetParams | null }
} {
  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>
  const { result, rerender } = renderHook<CowSwapWidgetParams | null, { params: CowSwapWidgetParams | null }>(
    ({ params }) => useWidgetParamsTradeType(params),
    { wrapper, initialProps: { params: buildParams(1) } },
  )

  return { store, result, rerender: (params) => rerender({ params }) }
}

describe('useWidgetParamsTradeType', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('opens the remembered tab', () => {
    const { store, result, rerender } = renderParams()

    store.set(tradeTypeAtom, TradeType.ADVANCED)
    rerender(buildParams(100))

    expect(result.current).toEqual({ ...buildParams(100), tradeType: TradeType.ADVANCED })
  })

  it('keeps the params when they are rebuilt with the same content after a tab change in the widget', () => {
    const { store, result, rerender } = renderParams()
    const initialParams = result.current

    store.set(tradeTypeAtom, TradeType.LIMIT)
    rerender(buildParams(1))

    expect(result.current).toBe(initialParams)
    expect(result.current?.tradeType).toBe(TradeType.SWAP)
  })

  it('returns null without params', () => {
    const { result, rerender } = renderParams()

    rerender(null)

    expect(result.current).toBeNull()
  })
})
