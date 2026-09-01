import { useListsEnabledState, useVirtualLists } from '@cowprotocol/tokens'

import { renderHook } from '@testing-library/react'

import { useEnabledTokensListsUrls } from './useEnabledTokensListsUrls'

jest.mock('@cowprotocol/tokens', () => ({
  useListsEnabledState: jest.fn(),
  useVirtualLists: jest.fn(),
}))

const useListsEnabledStateMock = jest.requireMock<{ useListsEnabledState: jest.Mock }>(
  '@cowprotocol/tokens',
).useListsEnabledState
const useVirtualListsMock = jest.requireMock<{ useVirtualLists: jest.Mock }>('@cowprotocol/tokens').useVirtualLists

function mockEnabledState(state: Record<string, boolean>): void {
  useListsEnabledStateMock.mockReturnValue(state as unknown as ReturnType<typeof useListsEnabledState>)
}

function mockVirtualListSources(sources: string[]): void {
  const state = Object.fromEntries(sources.map((source) => [source, { source }]))

  useVirtualListsMock.mockReturnValue(state as unknown as ReturnType<typeof useVirtualLists>)
}

describe('useEnabledTokensListsUrls', () => {
  beforeEach(() => {
    useListsEnabledStateMock.mockReset()
    useVirtualListsMock.mockReset()
    mockVirtualListSources([])
  })

  it('returns an empty array when no lists are enabled', () => {
    mockEnabledState({})

    const { result } = renderHook(() => useEnabledTokensListsUrls())

    expect(result.current).toEqual([])
  })

  it('excludes disabled list urls', () => {
    mockEnabledState({
      'https://example.com/list-a.json': true,
      'https://example.com/list-b.json': false,
    })

    const { result } = renderHook(() => useEnabledTokensListsUrls())

    expect(result.current).toEqual(['https://example.com/list-a.json'])
  })

  it('excludes virtual widget list sources (e.g. widgetCustomTokens)', () => {
    mockEnabledState({
      'https://example.com/list-a.json': true,
      widgetCustomTokens: true,
    })
    mockVirtualListSources(['widgetCustomTokens'])

    const { result } = renderHook(() => useEnabledTokensListsUrls())

    expect(result.current).toEqual(['https://example.com/list-a.json'])
  })

  it('keeps non-http(s) sources that are not virtual lists (e.g. ipfs/ipns/ENS)', () => {
    mockEnabledState({
      'ipfs://QmSomeHash': true,
      'tokens.uniswap.eth': true,
    })

    const { result } = renderHook(() => useEnabledTokensListsUrls())

    expect(result.current).toEqual(['ipfs://QmSomeHash', 'tokens.uniswap.eth'])
  })

  it('returns enabled list urls sorted alphabetically', () => {
    mockEnabledState({
      'https://example.com/z-list.json': true,
      'https://example.com/a-list.json': true,
    })

    const { result } = renderHook(() => useEnabledTokensListsUrls())

    expect(result.current).toEqual(['https://example.com/a-list.json', 'https://example.com/z-list.json'])
  })
})
