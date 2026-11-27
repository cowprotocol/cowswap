import { createStore, Provider } from 'jotai'
import { type ReactNode, useRef } from 'react'

import { act, fireEvent, render, screen, within } from '@testing-library/react'

import { TradeBarActions } from './TradeBarActions'

import { tradeSideAtom } from '../model/tradeSelectionAtoms'
import { TRADE_WIDGET_ID } from '../model/useSelectTradeToken'

import { mockViewport } from '@/shared/lib/testing'

jest.mock('wagmi', () => ({ useChainId: jest.fn(), useConnection: jest.fn(), useSwitchChain: jest.fn() }))
jest.mock('@/widgets/header', () => ({
  WALLET_BAR_HEIGHT: 56,
  WalletBarSlot: ({ children }: { children: ReactNode }) => <div data-testid="wallet-bar">{children}</div>,
}))

interface EdgeObserver {
  rootMargin: string | undefined
  report(isIntersecting: boolean): void
}

let edgeObservers: EdgeObserver[] = []

class MockIntersectionObserver {
  observe = jest.fn()
  disconnect = jest.fn()

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    edgeObservers.push({
      rootMargin: options?.rootMargin,
      report: (isIntersecting) =>
        callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver),
    })
  }
}

function TradeSection(): ReactNode {
  const widgetRef = useRef<HTMLElement>(null)

  return (
    <section ref={widgetRef} id={TRADE_WIDGET_ID}>
      <button type="button" data-trade-side="buy">
        Buy
      </button>
      <button type="button" data-trade-side="sell">
        Sell
      </button>
      <TradeBarActions ticker="NVDA" widgetRef={widgetRef} />
    </section>
  )
}

describe('TradeBarActions', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'IntersectionObserver', { value: MockIntersectionObserver })
    mockViewport(390)
  })

  beforeEach(() => {
    edgeObservers = []
  })

  function renderSection(): ReturnType<typeof createStore> {
    const store = createStore()

    render(
      <Provider store={store}>
        <TradeSection />
      </Provider>,
    )

    return store
  }

  it('shows Buy and Sell in the wallet bar until 120px of the widget shows above it', () => {
    renderSection()
    const bar = within(screen.getByTestId('wallet-bar'))
    const actions = [bar.getByRole('button', { name: 'Buy NVDA' }), bar.getByRole('button', { name: 'Sell NVDA' })]
    const areInert = (): boolean[] => actions.map((action) => action.closest('[inert]') !== null)

    const [topEdge, bottomEdge] = edgeObservers

    expect(edgeObservers.map(({ rootMargin }) => rootMargin)).toEqual(['-120px 0px 0px 0px', '0px 0px -176px 0px'])
    expect(areInert()).toEqual([false, false])

    act(() => topEdge.report(true))

    expect(areInert()).toEqual([false, false])

    act(() => bottomEdge.report(true))

    expect(areInert()).toEqual([true, true])

    act(() => topEdge.report(false))

    expect(areInert()).toEqual([false, false])
  })

  it('jumps to the widget on the chosen side', () => {
    const store = renderSection()

    fireEvent.click(screen.getByRole('button', { name: 'Sell NVDA' }))

    expect(store.get(tradeSideAtom)).toBe('sell')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sell' }))
  })
})
