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

    it('drops ipfs/ipns/ENS sources, which fail the whole session request on the watcher', () => {
      mockEnabledState({
        'ipfs://QmSomeHash': true,
        'ipns://tokens.uniswap.org': true,
        'tokens.uniswap.eth': true,
        'https://example.com/list-a.json': true,
      })

      expect(renderLists().tokensListsUrls).toEqual(['https://example.com/list-a.json'])
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

  describe('lists the watcher cannot fetch', () => {
    it('sends an ipfs list as addresses instead of as a url', () => {
      mockEnabledState({ 'ipfs://QmSomeHash': true })
      mockLoadedLists({ 'ipfs://QmSomeHash': [{ address: TOKEN_A, chainId: CHAIN_ID }] })

      expect(renderLists()).toEqual({ tokensListsUrls: [], listsTokens: [TOKEN_A] })
    })

    it('leaves a fetchable list as a url even once it is loaded here', () => {
      mockEnabledState({ 'https://example.com/list-a.json': true })
      mockLoadedLists({
        'https://example.com/list-a.json': [{ address: TOKEN_A, chainId: CHAIN_ID }],
      })

      expect(renderLists()).toEqual({
        tokensListsUrls: ['https://example.com/list-a.json'],
        listsTokens: [],
      })
    })

    it('ignores an ipfs list that is disabled', () => {
      mockEnabledState({ 'ipfs://QmSomeHash': false })
      mockLoadedLists({ 'ipfs://QmSomeHash': [{ address: TOKEN_A, chainId: CHAIN_ID }] })

      expect(renderLists()).toEqual({ tokensListsUrls: [], listsTokens: [] })
    })

    it('contributes nothing for an ipfs list this client never loaded', () => {
      mockEnabledState({ 'ipfs://QmSomeHash': true })

      expect(renderLists()).toEqual({ tokensListsUrls: [], listsTokens: [] })
    })

    it('drops tokens belonging to another chain', () => {
      mockEnabledState({ 'ipfs://QmSomeHash': true })
      mockLoadedLists({
        'ipfs://QmSomeHash': [
          { address: TOKEN_A, chainId: CHAIN_ID },
          { address: TOKEN_B, chainId: SupportedChainId.ARBITRUM_ONE },
        ],
      })

      expect(renderLists().listsTokens).toEqual([TOKEN_A])
    })

    it('deduplicates an address listed by two unfetchable lists, and sorts the result', () => {
      mockEnabledState({ 'ipfs://QmSomeHash': true, 'tokens.uniswap.eth': true })
      mockLoadedLists({
        'ipfs://QmSomeHash': [{ address: TOKEN_B, chainId: CHAIN_ID }],
        'tokens.uniswap.eth': [
          { address: TOKEN_B, chainId: CHAIN_ID },
          { address: TOKEN_A, chainId: CHAIN_ID },
        ],
      })

      expect(renderLists().listsTokens).toEqual([TOKEN_A, TOKEN_B])
    })
  })
})
