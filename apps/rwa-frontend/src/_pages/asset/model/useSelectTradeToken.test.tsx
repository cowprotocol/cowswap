import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { useConnection } from 'wagmi'

import { act, renderHook } from '@testing-library/react'

import { tradeSideAtom } from './tradeSelectionAtoms'
import { TRADE_WIDGET_ID, useIsWalletOffTradeNetwork, useJumpToTrade } from './useSelectTradeToken'

import type { RwaQuoteSide } from '@/entities/asset'

jest.mock('wagmi', () => ({ useChainId: jest.fn(), useConnection: jest.fn(), useSwitchChain: jest.fn() }))

const media = { isSingleColumn: true, isReducedMotion: false }

describe('useJumpToTrade', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: (query: string) => ({
        matches: query.includes('prefers-reduced-motion') ? media.isReducedMotion : media.isSingleColumn,
      }),
    })
  })

  beforeEach(() => {
    media.isSingleColumn = true
    media.isReducedMotion = false
    document.body.innerHTML = `<section id="${TRADE_WIDGET_ID}">
      <button type="button" data-trade-side="buy">Buy</button>
      <button type="button" data-trade-side="sell">Sell</button>
    </section>`
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  function jumpToTrade(side: RwaQuoteSide): ReturnType<typeof createStore> {
    const store = createStore()
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>
    const { result } = renderHook(() => useJumpToTrade(), { wrapper })

    act(() => result.current(side))

    return store
  }

  it('switches the widget to the side, scrolls it to the top and focuses the side toggle', () => {
    const scrollIntoView = jest.spyOn(Element.prototype, 'scrollIntoView')

    const store = jumpToTrade('sell')

    expect(store.get(tradeSideAtom)).toBe('sell')
    expect(scrollIntoView.mock.contexts).toEqual([document.getElementById(TRADE_WIDGET_ID)])
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(document.activeElement?.textContent).toBe('Sell')
  })

  it('only brings the widget beside the chart into view, without motion when it is reduced', () => {
    media.isSingleColumn = false
    media.isReducedMotion = true
    const scrollIntoView = jest.spyOn(Element.prototype, 'scrollIntoView')

    jumpToTrade('buy')

    expect(scrollIntoView.mock.contexts).toEqual([document.getElementById(TRADE_WIDGET_ID)])
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'nearest' })
    expect(document.activeElement).toBe(document.body)
  })
})

describe('useIsWalletOffTradeNetwork', () => {
  const useConnectionMock = useConnection as jest.Mock

  it.each([
    { isConnected: true, chainId: 100, expected: true },
    { isConnected: true, chainId: 11155111, expected: true },
    { isConnected: true, chainId: 1, expected: false },
    { isConnected: false, chainId: undefined, expected: false },
  ])('is $expected for a wallet on $chainId (connected: $isConnected) trading on Ethereum', (connection) => {
    useConnectionMock.mockReturnValue(connection)

    const { result } = renderHook(() => useIsWalletOffTradeNetwork(1))

    expect(result.current).toBe(connection.expected)
  })
})
