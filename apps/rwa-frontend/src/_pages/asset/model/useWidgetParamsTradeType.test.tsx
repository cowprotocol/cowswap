import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { type CowSwapWidgetParams, type EthereumProvider, TradeType } from '@cowprotocol/widget-lib'

import { renderHook } from '@testing-library/react'

import { tradeTypeAtom } from './tradeTypeAtom'
import { useWidgetParamsTradeType } from './useWidgetParamsTradeType'

function buildParams(chainId: number): CowSwapWidgetParams {
  return { appCode: 'CoW RWA', chainId, sell: { asset: 'USDC', amount: '1000' } }
}

const PROVIDER = { request: jest.fn() } as unknown as EthereumProvider

function renderParams(): {
  store: ReturnType<typeof createStore>
  rerender: (params: CowSwapWidgetParams | null, provider?: EthereumProvider) => void
  result: { current: CowSwapWidgetParams | null }
} {
  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>
  const { result, rerender } = renderHook<
    CowSwapWidgetParams | null,
    { params: CowSwapWidgetParams | null; provider: EthereumProvider | undefined }
  >(({ params, provider }) => useWidgetParamsTradeType(params, provider), {
    wrapper,
    initialProps: { params: buildParams(1), provider: PROVIDER },
  })

  return { store, result, rerender: (params, provider = PROVIDER) => rerender({ params, provider }) }
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

  it('keeps the sent tab when only the theme changes after a tab change in the widget', () => {
    const { store, result, rerender } = renderParams()

    store.set(tradeTypeAtom, TradeType.LIMIT)
    rerender({ ...buildParams(1), theme: 'dark' })

    expect(result.current).toEqual({ ...buildParams(1), theme: 'dark', tradeType: TradeType.SWAP })
  })

  it('opens the remembered tab in the iframe recreated for a new provider', () => {
    const { store, result, rerender } = renderParams()

    store.set(tradeTypeAtom, TradeType.LIMIT)
    rerender(buildParams(1), { request: jest.fn() } as unknown as EthereumProvider)

    expect(result.current).toEqual({ ...buildParams(1), tradeType: TradeType.LIMIT })
  })

  it('returns null without params', () => {
    const { result, rerender } = renderParams()

    rerender(null)

    expect(result.current).toBeNull()
  })
})
