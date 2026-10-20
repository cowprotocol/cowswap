import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAllListsList, useListsEnabledState, useVirtualLists } from '@cowprotocol/tokens'

import { renderHook } from '@testing-library/react'

import { useWatcherTokensLists } from './useWatcherTokensLists'

jest.mock('@cowprotocol/tokens', () => ({
  useAllListsList: jest.fn(),
  useListsEnabledState: jest.fn(),
  useVirtualLists: jest.fn(),
}))

const useAllListsListMock = jest.requireMock<{ useAllListsList: jest.Mock }>('@cowprotocol/tokens').useAllListsList
const useListsEnabledStateMock = jest.requireMock<{ useListsEnabledState: jest.Mock }>(
  '@cowprotocol/tokens',
).useListsEnabledState
const useVirtualListsMock = jest.requireMock<{ useVirtualLists: jest.Mock }>('@cowprotocol/tokens').useVirtualLists

const CHAIN_ID = SupportedChainId.MAINNET
const TOKEN_A = '0x1111111111111111111111111111111111111111'
const TOKEN_B = '0x2222222222222222222222222222222222222222'

function mockEnabledState(state: Record<string, boolean>): void {
  useListsEnabledStateMock.mockReturnValue(state as unknown as ReturnType<typeof useListsEnabledState>)
}

function mockLoadedLists(lists: Record<string, Array<{ address: string; chainId: number }>>): void {
  const states = Object.entries(lists).map(([source, tokens]) => ({ source, list: { tokens } }))

  useAllListsListMock.mockReturnValue(states as unknown as ReturnType<typeof useAllListsList>)
}

function mockVirtualListSources(sources: string[]): void {
  const state = Object.fromEntries(sources.map((source) => [source, { source }]))

  useVirtualListsMock.mockReturnValue(state as unknown as ReturnType<typeof useVirtualLists>)
}

function renderLists(chainId: SupportedChainId = CHAIN_ID): ReturnType<typeof useWatcherTokensLists> {
  return renderHook(() => useWatcherTokensLists(chainId)).result.current
}

describe('useWatcherTokensLists', () => {
  beforeEach(() => {
    useAllListsListMock.mockReset()
    useListsEnabledStateMock.mockReset()
    useVirtualListsMock.mockReset()
    mockVirtualListSources([])
    mockLoadedLists({})
  })

  describe('urls the watcher still has to fetch', () => {
    it('returns nothing when no lists are enabled', () => {
      mockEnabledState({})

      expect(renderLists()).toEqual({ tokensListsUrls: [], listsTokens: [] })
    })

    it('excludes disabled list urls', () => {
      mockEnabledState({
        'https://example.com/list-a.json': true,
        'https://example.com/list-b.json': false,
      })

      expect(renderLists().tokensListsUrls).toEqual(['https://example.com/list-a.json'])
    })

    it('excludes virtual widget list sources (e.g. widgetCustomTokens)', () => {
      mockEnabledState({
        'https://example.com/list-a.json': true,
        widgetCustomTokens: true,
      })
      mockVirtualListSources(['widgetCustomTokens'])

      expect(renderLists().tokensListsUrls).toEqual(['https://example.com/list-a.json'])
    })

    it('keeps non-http(s) sources that are not virtual lists (e.g. ipfs/ipns/ENS)', () => {
      mockEnabledState({ 'ipfs://QmSomeHash': true, 'tokens.uniswap.eth': true })

      expect(renderLists().tokensListsUrls).toEqual(['ipfs://QmSomeHash', 'tokens.uniswap.eth'])
    })

    it('returns urls sorted alphabetically', () => {
      mockEnabledState({
        'https://example.com/z-list.json': true,
        'https://example.com/a-list.json': true,
      })

      expect(renderLists().tokensListsUrls).toEqual([
        'https://example.com/a-list.json',
        'https://example.com/z-list.json',
      ])
    })
  })

  describe('lists already parsed here', () => {
    it('sends their tokens as addresses instead of the url', () => {
      mockEnabledState({ 'https://example.com/list-a.json': true })
      mockLoadedLists({
        'https://example.com/list-a.json': [{ address: TOKEN_A, chainId: CHAIN_ID }],
      })

      expect(renderLists()).toEqual({ tokensListsUrls: [], listsTokens: [TOKEN_A] })
    })

    it('keeps an unloaded list on the url side while covering a loaded one', () => {
      mockEnabledState({
        'https://example.com/loaded.json': true,
        'https://example.com/pending.json': true,
      })
      mockLoadedLists({
        'https://example.com/loaded.json': [{ address: TOKEN_A, chainId: CHAIN_ID }],
      })

      expect(renderLists()).toEqual({
        tokensListsUrls: ['https://example.com/pending.json'],
        listsTokens: [TOKEN_A],
      })
    })

    it('ignores a loaded list that is disabled', () => {
      mockEnabledState({ 'https://example.com/list-a.json': false })
      mockLoadedLists({
        'https://example.com/list-a.json': [{ address: TOKEN_A, chainId: CHAIN_ID }],
      })

      expect(renderLists()).toEqual({ tokensListsUrls: [], listsTokens: [] })
    })

    it('keeps a list whose fetch left it empty on the url side, so it is not silently dropped', () => {
      mockEnabledState({ 'https://example.com/list-a.json': true })
      mockLoadedLists({ 'https://example.com/list-a.json': [] })

      expect(renderLists()).toEqual({
        tokensListsUrls: ['https://example.com/list-a.json'],
        listsTokens: [],
      })
    })

    it('drops tokens belonging to another chain', () => {
      mockEnabledState({ 'https://example.com/list-a.json': true })
      mockLoadedLists({
        'https://example.com/list-a.json': [
          { address: TOKEN_A, chainId: CHAIN_ID },
          { address: TOKEN_B, chainId: SupportedChainId.ARBITRUM_ONE },
        ],
      })

      expect(renderLists().listsTokens).toEqual([TOKEN_A])
    })

    it('deduplicates an address listed by two lists, and sorts the result', () => {
      mockEnabledState({
        'https://example.com/list-a.json': true,
        'https://example.com/list-b.json': true,
      })
      mockLoadedLists({
        'https://example.com/list-a.json': [{ address: TOKEN_B, chainId: CHAIN_ID }],
        'https://example.com/list-b.json': [
          { address: TOKEN_B, chainId: CHAIN_ID },
          { address: TOKEN_A, chainId: CHAIN_ID },
        ],
      })

      expect(renderLists().listsTokens).toEqual([TOKEN_A, TOKEN_B])
    })
  })
})
