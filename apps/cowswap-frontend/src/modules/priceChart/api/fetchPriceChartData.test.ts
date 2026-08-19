import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fetchPriceChartData } from './fetchPriceChartData'

jest.mock('@cowprotocol/common-utils', () => ({
  fetchWithTimeout: jest.fn(),
}))

const mockedFetchWithTimeout = jest.mocked(fetchWithTimeout)

function createResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('fetchPriceChartData', () => {
  beforeEach(() => {
    mockedFetchWithTimeout.mockReset()
  })

  it('fetches normalized token bars through the BFF', async () => {
    const bars = [
      {
        open: 1,
        high: 3,
        low: 0.5,
        close: 2.5,
        time: 1710000000,
        status: 'ok',
        volume: '100.25',
      },
    ]
    mockedFetchWithTimeout.mockResolvedValue(createResponse({ bars }))

    await expect(
      fetchPriceChartData({
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chainId: SupportedChainId.MAINNET,
        from: 1710000000,
        to: 1710007200,
        resolution: '60',
        countback: 300,
      }),
    ).resolves.toEqual(bars)

    const requestUrl = new URL(String(mockedFetchWithTimeout.mock.calls[0]?.[0]))
    expect(`${requestUrl.origin}${requestUrl.pathname}`).toBe(`${BFF_BASE_URL}/proxies/codex/token-bars`)
    expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      chainId: '1',
      from: '1710000000',
      to: '1710007200',
      resolution: '60',
      currencyCode: 'USD',
      countback: '300',
      removeEmptyBars: 'true',
      removeLeadingNullValues: 'true',
    })
    expect(mockedFetchWithTimeout).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        timeout: 10_000,
      }),
    )
  })

  it('forwards token quotes and explicit trimming flags', async () => {
    mockedFetchWithTimeout.mockResolvedValue(createResponse({ bars: [] }))

    await fetchPriceChartData({
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      chainId: SupportedChainId.MAINNET,
      from: 1710000000,
      to: 1710007200,
      resolution: '60',
      currencyCode: 'TOKEN',
      removeEmptyBars: false,
      removeLeadingNullValues: false,
    })

    const requestUrl = new URL(String(mockedFetchWithTimeout.mock.calls[0]?.[0]))
    expect(requestUrl.searchParams.get('currencyCode')).toBe('TOKEN')
    expect(requestUrl.searchParams.get('removeEmptyBars')).toBe('false')
    expect(requestUrl.searchParams.get('removeLeadingNullValues')).toBe('false')
  })

  it('rejects unsuccessful BFF responses', async () => {
    mockedFetchWithTimeout.mockResolvedValue(createResponse({ message: 'Provider failed' }, 502))

    await expect(
      fetchPriceChartData({
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chainId: SupportedChainId.MAINNET,
        from: 1710000000,
        to: 1710007200,
        resolution: '60',
      }),
    ).rejects.toThrow('Price chart request failed with status 502')
  })
})
