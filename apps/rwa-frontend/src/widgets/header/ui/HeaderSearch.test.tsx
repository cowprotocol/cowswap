import { createStore, Provider } from 'jotai'

import { QueryClient } from '@tanstack/query-core'

import { fireEvent, render, screen } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { HeaderSearch } from './HeaderSearch'

import type { RwaAssetsSearchResult, RwaAssetWithMarket } from '@/entities/asset'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))

function asset(ticker: string, title: string): RwaAssetWithMarket {
  return { ticker, coingeckoId: ticker.toLowerCase(), title, type: 'stock', priority: 0, tokens: [], market: null }
}

const RESULT: RwaAssetsSearchResult = { items: [asset('NVDA', 'NVIDIA'), asset('NFLX', 'Netflix')], degraded: false }

function renderSearch(): HTMLElement {
  const store = createStore()
  store.set(queryClientAtom, new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  render(
    <Provider store={store}>
      <HeaderSearch />
    </Provider>,
  )

  return screen.getByRole('combobox', { name: 'Search assets' })
}

describe('HeaderSearch', () => {
  beforeAll(() => {
    // jsdom has no matchMedia, `TokenLogo` reads the color scheme through it
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }),
    })
  })

  beforeEach(() => {
    mockPush.mockReset()
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(RESULT) }),
    ) as unknown as typeof fetch
  })

  it('requests up to five suggestions', async () => {
    const input = renderSearch()

    fireEvent.change(input, { target: { value: 'n' } })

    expect(await screen.findByRole('option', { name: /NVIDIA/ })).toBeTruthy()
    expect(String((global.fetch as jest.Mock).mock.calls[0]?.[0])).toContain('limit=5')
  })

  it('opens the highlighted asset on Enter', async () => {
    const input = renderSearch()

    fireEvent.change(input, { target: { value: 'n' } })
    await screen.findByRole('option', { name: /NVIDIA/ })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    expect(screen.getByRole('option', { name: /Netflix/ }).getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockPush).toHaveBeenCalledWith('/asset/NFLX')
  })

  it('closes on Escape and keeps the query', async () => {
    const input = renderSearch()

    fireEvent.change(input, { target: { value: 'n' } })
    await screen.findByRole('option', { name: /NVIDIA/ })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect((input as HTMLInputElement).value).toBe('n')
  })

  it('focuses on the slash key', () => {
    const input = renderSearch()

    fireEvent.keyDown(document.body, { key: '/' })

    expect(document.activeElement).toBe(input)
  })
})
