/**
 * @jest-environment node
 */
import { OrderBookApiError, SupportedChainId } from '@cowprotocol/cow-sdk'

import { getTokenQuotes } from './quotes'

import { getServerOrderBookApi } from '@/shared/api/index.server'

const getQuoteMock = jest.fn()

const mockCachedCall = jest.fn()

jest.mock('next/cache', () => ({
  unstable_cache:
    (fn: (...args: unknown[]) => unknown) =>
    (...args: unknown[]) => {
      mockCachedCall(...args)

      return fn(...args)
    },
}))
jest.mock('@/shared/api/index.server', () => ({ getServerOrderBookApi: jest.fn() }))

const AAPLX = '0x9d275685dC284C8eB1C79f6ABA7a63Dc75ec890a'
const AAPLON = '0x14c3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c'
const USDC_MAINNET = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

function orderBookError(status: number, body: unknown): OrderBookApiError {
  return new OrderBookApiError(new Response(null, { status }), body)
}

function quoteResponse(sellAmount: string, buyAmount: string, feeAmount = '0', verified = true): unknown {
  return { quote: { sellAmount, buyAmount, feeAmount }, verified }
}

describe('getTokenQuotes', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    jest.mocked(getServerOrderBookApi).mockReturnValue({ getQuote: getQuoteMock } as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    getQuoteMock.mockReset()
    mockCachedCall.mockReset()
  })

  it('keys the cache by minute, so cached quotes never outlive a minute', async () => {
    getQuoteMock.mockResolvedValue(quoteResponse('1', '2'))
    const nowMock = jest.spyOn(Date, 'now')

    nowMock.mockReturnValue(119_999)
    await getTokenQuotes(SupportedChainId.MAINNET, 'buy', [AAPLX])
    nowMock.mockReturnValue(120_000)
    await getTokenQuotes(SupportedChainId.MAINNET, 'buy', [AAPLX])

    expect(mockCachedCall.mock.calls.map((args: unknown[]) => args[3])).toEqual([1, 2])
  })

  it('sells 1000 USDC on buy and returns the received asset amount', async () => {
    getQuoteMock.mockResolvedValue(quoteResponse('999000000', '3010000000000000000', '1000000'))

    const result = await getTokenQuotes(SupportedChainId.MAINNET, 'buy', [AAPLX])

    expect(getQuoteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'sell',
        sellToken: USDC_MAINNET,
        buyToken: AAPLX,
        sellAmountBeforeFee: '1000000000',
      }),
      { chainId: SupportedChainId.MAINNET },
    )
    expect(result).toEqual({
      quotes: [{ address: AAPLX, amount: '3010000000000000000', verified: true, error: null }],
      degraded: false,
    })
  })

  it('buys 1000 USDC on sell and returns the spent asset amount including the fee', async () => {
    getQuoteMock.mockResolvedValue(quoteResponse('3000000000000000000', '1000000000', '20000000000000000'))

    const result = await getTokenQuotes(SupportedChainId.MAINNET, 'sell', [AAPLX])

    expect(getQuoteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'buy',
        sellToken: AAPLX,
        buyToken: USDC_MAINNET,
        buyAmountAfterFee: '1000000000',
      }),
      { chainId: SupportedChainId.MAINNET },
    )
    expect(result.quotes).toEqual([{ address: AAPLX, amount: '3020000000000000000', verified: true, error: null }])
  })

  it('keeps whether the order book verified the quote', async () => {
    getQuoteMock.mockResolvedValue(quoteResponse('1', '2', '0', false))

    const result = await getTokenQuotes(SupportedChainId.BNB, 'buy', [AAPLX])

    expect(result.quotes).toEqual([{ address: AAPLX, amount: '2', verified: false, error: null }])
  })

  it('uses the 18 decimals of BNB USDC', async () => {
    getQuoteMock.mockResolvedValue(quoteResponse('1', '1'))

    await getTokenQuotes(SupportedChainId.BNB, 'buy', [AAPLX])

    expect(getQuoteMock).toHaveBeenCalledWith(
      expect.objectContaining({ sellAmountBeforeFee: '1000000000000000000000' }),
      { chainId: SupportedChainId.BNB },
    )
  })

  it('keeps a rejected quote as a result, not as an outage', async () => {
    getQuoteMock
      .mockResolvedValueOnce(quoteResponse('1', '2'))
      .mockRejectedValueOnce(orderBookError(400, { errorType: 'NoLiquidity', description: 'no route' }))

    expect(await getTokenQuotes(SupportedChainId.MAINNET, 'buy', [AAPLX, AAPLON])).toEqual({
      quotes: [
        { address: AAPLX, amount: '2', verified: true, error: null },
        { address: AAPLON, amount: null, verified: false, error: 'NoLiquidity' },
      ],
      degraded: false,
    })
  })

  it.each([
    ['a server error', orderBookError(500, { errorType: 'InternalServerError' })],
    ['rate limiting', orderBookError(429, {})],
    ['a network error', new TypeError('fetch failed')],
  ])('marks the result as degraded on %s', async (_case, error) => {
    getQuoteMock.mockResolvedValueOnce(quoteResponse('1', '2')).mockRejectedValueOnce(error)

    expect(await getTokenQuotes(SupportedChainId.MAINNET, 'buy', [AAPLX, AAPLON])).toEqual({
      quotes: [
        { address: AAPLX, amount: '2', verified: true, error: null },
        { address: AAPLON, amount: null, verified: false, error: 'Unavailable' },
      ],
      degraded: true,
    })
  })
})
