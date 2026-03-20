import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId, getAddressKey } from '@cowprotocol/cow-sdk'
import { fetchTokenFromBlockchain } from '@cowprotocol/tokens'
import type { TokensByAddress } from '@cowprotocol/tokens'

import { fetchTokens, resetFetchTokensCache } from './fetchTokens.utils'

const mockGetRpcProvider = jest.fn()

jest.mock('@cowprotocol/common-const', () => ({
  ...jest.requireActual<typeof import('@cowprotocol/common-const')>('@cowprotocol/common-const'),
  getRpcProvider: (...args: unknown[]) => mockGetRpcProvider(...args),
}))

jest.mock('@cowprotocol/tokens', () => ({
  ...jest.requireActual<typeof import('@cowprotocol/tokens')>('@cowprotocol/tokens'),
  fetchTokenFromBlockchain: jest.fn(),
}))

const mockFetchTokenFromBlockchain = jest.mocked(fetchTokenFromBlockchain)

const CHAIN = SupportedChainId.MAINNET
const ADDR_A = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const ADDR_B = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

function makeToken(address: string): TokenWithLogo {
  return TokenWithLogo.fromToken({
    chainId: CHAIN,
    address,
    name: 'T',
    symbol: 'T',
    decimals: 18,
  })
}

describe('fetchTokens', () => {
  beforeEach(() => {
    resetFetchTokensCache()
    mockGetRpcProvider.mockReturnValue({})
    mockFetchTokenFromBlockchain.mockReset()
  })

  it('returns null when RPC provider is missing', async () => {
    mockGetRpcProvider.mockReturnValue(undefined)

    await expect(fetchTokens(CHAIN, {}, [ADDR_A])).resolves.toBeNull()
  })

  it('returns an empty map when no addresses are requested', async () => {
    await expect(fetchTokens(CHAIN, {}, [])).resolves.toEqual({})
  })

  it('includes every requested address key, resolving from tokensByAddress without fetch', async () => {
    const ta: TokensByAddress = {
      [getAddressKey(ADDR_A)]: makeToken(ADDR_A),
      [getAddressKey(ADDR_B)]: makeToken(ADDR_B),
    }

    const result = await fetchTokens(CHAIN, ta, [ADDR_A, ADDR_B])

    expect(mockFetchTokenFromBlockchain).not.toHaveBeenCalled()
    expect(result).toEqual(expect.objectContaining(ta))
    expect(Object.keys(result ?? {})).toEqual(expect.arrayContaining([getAddressKey(ADDR_A), getAddressKey(ADDR_B)]))
    expect(Object.keys(result ?? {})).toHaveLength(2)
  })

  it('rejects when any on-chain fetch fails', async () => {
    mockFetchTokenFromBlockchain.mockImplementation(async (addr: string) => {
      if (getAddressKey(addr) === getAddressKey(ADDR_B)) {
        throw new Error('rpc failed')
      }
      return {
        chainId: CHAIN,
        address: addr,
        name: 'A',
        symbol: 'A',
        decimals: 18,
      }
    })

    await expect(fetchTokens(CHAIN, {}, [ADDR_A, ADDR_B])).rejects.toThrow('rpc failed')
  })

  it('deduplicates fetches when the same address is requested more than once', async () => {
    mockFetchTokenFromBlockchain.mockResolvedValue({
      chainId: CHAIN,
      address: ADDR_A,
      name: 'A',
      symbol: 'A',
      decimals: 18,
    })

    const result = await fetchTokens(CHAIN, {}, [ADDR_A, ADDR_A])

    expect(mockFetchTokenFromBlockchain).toHaveBeenCalledTimes(1)
    expect(Object.keys(result ?? {})).toEqual([getAddressKey(ADDR_A)])
  })
})
