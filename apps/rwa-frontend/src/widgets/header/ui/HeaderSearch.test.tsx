import { createStore, Provider } from 'jotai'
import type { ReactElement } from 'react'

import { QueryClient } from '@tanstack/query-core'

import { fireEvent, render, screen } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { HeaderSearch } from './HeaderSearch'

import type { RwaAssetsSearchResult, RwaAssetWithMarket } from '@/entities/asset'

import { mockViewport } from '@/shared/lib/testing'

const FULL_SCREEN_WIDTH = 390
const PAST_FULL_SCREEN_WIDTH = 800

const mockPush = jest.fn()
let mockPathname = '/'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }), usePathname: () => mockPathname }))

function asset(ticker: string, title: string): RwaAssetWithMarket {
  return { ticker, coingeckoId: ticker.toLowerCase(), title, type: 'stock', priority: 0, tokens: [], market: null }
}

const RESULT: RwaAssetsSearchResult = { items: [asset('NVDA', 'NVIDIA'), asset('NFLX', 'Netflix')], degraded: false }

function renderSearch(): { input: HTMLElement; rerender(): void } {
  const store = createStore()
  store.set(queryClientAtom, new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  const tree = (): ReactElement => (
    <Provider store={store}>
      <HeaderSearch />
    </Provider>
  )
  const view = render(tree())

  return { input: screen.getByRole('combobox', { name: 'Search assets' }), rerender: () => view.rerender(tree()) }
}

describe('HeaderSearch', () => {
  let setWidth: (width: number) => void

  beforeEach(() => {
    setWidth = mockViewport(FULL_SCREEN_WIDTH)
    mockPathname = '/'
    mockPush.mockReset()
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(RESULT) }),
    ) as unknown as typeof fetch
  })

  it('requests up to five suggestions', async () => {
    const { input } = renderSearch()

    fireEvent.change(input, { target: { value: 'n' } })

    expect(await screen.findByRole('option', { name: /NVIDIA/ })).toBeTruthy()
    expect(String((global.fetch as jest.Mock).mock.calls[0]?.[0])).toContain('limit=5')
  })

  it('opens the highlighted asset on Enter', async () => {
    const { input } = renderSearch()

    fireEvent.change(input, { target: { value: 'n' } })
    await screen.findByRole('option', { name: /NVIDIA/ })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    expect(screen.getByRole('option', { name: /Netflix/ }).getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockPush).toHaveBeenCalledWith('/asset/NFLX')
  })

  it('closes on Escape and keeps the query', async () => {
    const { input } = renderSearch()

    fireEvent.change(input, { target: { value: 'n' } })
    await screen.findByRole('option', { name: /NVIDIA/ })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect((input as HTMLInputElement).value).toBe('n')
  })

  it('focuses on the slash key', () => {
    const { input } = renderSearch()

    fireEvent.keyDown(document.body, { key: '/' })

    expect(document.activeElement).toBe(input)
  })

  it('shows the field from the search button and hides it on Escape', () => {
    const { input } = renderSearch()
    const button = screen.getByRole('button', { name: 'Search' })

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(input)

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(button)
  })

  it('hides the field from the close button', () => {
    renderSearch()
    const button = screen.getByRole('button', { name: 'Search' })

    fireEvent.click(button)
    fireEvent.click(screen.getByRole('button', { name: 'Close search' }))

    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(button)
  })

  it('hides the field on Escape from the close button and marks the Escape handled', () => {
    renderSearch()
    const button = screen.getByRole('button', { name: 'Search' })

    fireEvent.click(button)
    const isNotHandled = fireEvent.keyDown(screen.getByRole('button', { name: 'Close search' }), { key: 'Escape' })

    expect(isNotHandled).toBe(false)
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(button)
  })

  it('hides the field on Escape while the focus is outside it', () => {
    renderSearch()
    const button = screen.getByRole('button', { name: 'Search' })

    fireEvent.click(button)
    fireEvent.keyDown(document.body, { key: 'Escape' })

    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('hides the field when the viewport grows past the full-screen breakpoint', () => {
    renderSearch()
    const button = screen.getByRole('button', { name: 'Search' })

    fireEvent.click(button)
    setWidth(PAST_FULL_SCREEN_WIDTH)

    expect(button.getAttribute('aria-expanded')).toBe('false')

    setWidth(FULL_SCREEN_WIDTH)

    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('hides the field when the page changes', () => {
    const { rerender } = renderSearch()
    const button = screen.getByRole('button', { name: 'Search' })

    fireEvent.click(button)
    mockPathname = '/asset/NVDA'
    rerender()

    expect(button.getAttribute('aria-expanded')).toBe('false')

    mockPathname = '/'
    rerender()

    expect(button.getAttribute('aria-expanded')).toBe('false')
  })
})
