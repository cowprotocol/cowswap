import { createStore, Provider } from 'jotai'
import { type ReactNode, useRef } from 'react'

import { act, fireEvent, render, screen, within } from '@testing-library/react'

import { TradeBarActions } from './TradeBarActions'

import { tradeSideAtom } from '../model/tradeSelectionAtoms'
import { TRADE_WIDGET_ID } from '../model/useSelectTradeToken'

jest.mock('wagmi', () => ({ useChainId: jest.fn(), useConnection: jest.fn(), useSwitchChain: jest.fn() }))
jest.mock('@/widgets/header', () => ({
  WalletBarSlot: ({ children }: { children: ReactNode }) => <div data-testid="wallet-bar">{children}</div>,
}))

let reportVisibleHeight: (height: number) => void = () => undefined

class MockIntersectionObserver {
  observe = jest.fn()
  disconnect = jest.fn()

  constructor(callback: IntersectionObserverCallback) {
    reportVisibleHeight = (height) =>
      callback([{ intersectionRect: { height } } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
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
    Object.defineProperty(window, 'matchMedia', { value: () => ({ matches: true }) })
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
    const buy = within(screen.getByTestId('wallet-bar')).getByRole('button', { name: 'Buy NVDA' })

    expect(buy.closest('[inert]')).toBeNull()

    act(() => reportVisibleHeight(119))

    expect(buy.closest('[inert]')).toBeNull()

    act(() => reportVisibleHeight(120))

    expect(buy.closest('[inert]')).not.toBeNull()

    act(() => reportVisibleHeight(0))

    expect(buy.closest('[inert]')).toBeNull()
  })

  it('jumps to the widget on the chosen side', () => {
    const store = renderSection()

    fireEvent.click(screen.getByRole('button', { name: 'Sell NVDA' }))

    expect(store.get(tradeSideAtom)).toBe('sell')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sell' }))
  })
})
