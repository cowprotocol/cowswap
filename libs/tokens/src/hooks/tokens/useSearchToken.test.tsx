import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { act, renderHook } from '@testing-library/react'
import { SWRConfig } from 'swr'

import { useSearchToken } from './useSearchToken'

const CHAIN_ID = 1

function createToken(address: string, symbol: string): TokenWithLogo {
  return new TokenWithLogo(undefined, CHAIN_ID, address, 18, symbol, `${symbol} Token`)
}

const mockActiveTokens = [
  createToken('0x0000000000000000000000000000000000000001', 'COW'),
  createToken('0x0000000000000000000000000000000000000002', 'WETH'),
]
const mockInactiveTokens = [
  createToken('0x0000000000000000000000000000000000000003', 'COWX'),
  createToken('0x0000000000000000000000000000000000000004', 'USDC'),
]

jest.mock('../../state/tokens/allTokensAtom', () => {
  const { atom } = jest.requireActual('jotai')

  return {
    allActiveTokensAtom: atom(() => ({ tokens: mockActiveTokens })),
    inactiveTokensAtom: atom(() => mockInactiveTokens),
  }
})
jest.mock('../../services/searchTokensInApi', () => ({ searchTokensInApi: jest.fn(async () => []) }))
jest.mock('./useFetchTokenFromBlockchain', () => ({ useFetchTokenFromBlockchain: () => jest.fn(async () => null) }))
jest.mock('@reown/appkit-adapter-solana/react', () => ({ useAppKitConnection: () => ({ connection: undefined }) }))

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
}

describe('useSearchToken — token lists', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns matches from active and inactive lists as soon as the list debounce elapses', () => {
    const { result } = renderHook(() => useSearchToken('cow'), { wrapper })

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(result.current.activeListsResult.map((token) => token.symbol)).toEqual(['COW'])
    expect(result.current.inactiveListsResult.map((token) => token.symbol)).toEqual(['COWX'])
  })

  it('finds a token by address in the inactive lists', () => {
    const { result } = renderHook(() => useSearchToken('0x0000000000000000000000000000000000000004'), { wrapper })

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(result.current.activeListsResult).toEqual([])
    expect(result.current.inactiveListsResult.map((token) => token.symbol)).toEqual(['USDC'])
  })

  it('returns no list results without input', () => {
    const { result } = renderHook(() => useSearchToken(null), { wrapper })

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(result.current.activeListsResult).toEqual([])
    expect(result.current.inactiveListsResult).toEqual([])
  })
})
