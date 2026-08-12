import { useListsEnabledState } from '@cowprotocol/tokens'

import { renderHook } from '@testing-library/react'

import { useEnabledTokensListsUrls } from './useEnabledTokensListsUrls'

jest.mock('@cowprotocol/tokens', () => ({
  useListsEnabledState: jest.fn(),
}))

const useListsEnabledStateMock = jest.requireMock<{ useListsEnabledState: jest.Mock }>(
  '@cowprotocol/tokens',
).useListsEnabledState

function mockEnabledState(state: Record<string, boolean>): void {
  useListsEnabledStateMock.mockReturnValue(state as unknown as ReturnType<typeof useListsEnabledState>)
}

describe('useEnabledTokensListsUrls', () => {
  beforeEach(() => {
    useListsEnabledStateMock.mockReset()
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

  it('excludes non-http(s) sources such as virtual widget list ids', () => {
    mockEnabledState({
      'https://example.com/list-a.json': true,
      widgetCustomTokens: true,
    })

    const { result } = renderHook(() => useEnabledTokensListsUrls())

    expect(result.current).toEqual(['https://example.com/list-a.json'])
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
