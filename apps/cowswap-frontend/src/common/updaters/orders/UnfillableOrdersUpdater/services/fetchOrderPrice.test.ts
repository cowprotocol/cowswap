// Mocked before imports: `tradingSdk` resolves the chain id from the URL at module load
jest.mock('tradingSdk/tradingSdk', () => ({
  tradingSdk: { getQuote: jest.fn() },
}))

jest.mock('entities/captcha/state/captchaCanQuoteAtom', () => ({
  captchaCanQuoteAtom: jest.requireActual('jotai').atom(true),
}))

import { OrderKind, PriceQuality, SupportedChainId } from '@cowprotocol/cow-sdk'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { GenericOrder } from 'common/types'

import { fetchOrderPrice } from './fetchOrderPrice'

const order = {
  kind: OrderKind.SELL,
  owner: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
  receiver: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
  partiallyFillable: false,
  sellAmountBeforeFee: '1000000000000000000',
  buyAmount: '2000000000',
  inputToken: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18 },
  outputToken: { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
} as unknown as GenericOrder

describe('fetchOrderPrice()', () => {
  beforeEach(() => {
    jest.mocked(tradingSdk.getQuote).mockResolvedValue({ quoteResults: {} } as never)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // This price quality must stay explicit: the SDK falls back to `optimal` on its own, so an
  // omitted setting looks identical today and silently diverges from the rest of the app.
  it('Requests an optimal quote, since this price only feeds the orders table and never places an order', async () => {
    await fetchOrderPrice(SupportedChainId.MAINNET, order)

    expect(tradingSdk.getQuote).toHaveBeenCalledTimes(1)
    expect(jest.mocked(tradingSdk.getQuote).mock.calls[0]?.[1]).toEqual({
      quoteRequest: { priceQuality: PriceQuality.OPTIMAL },
    })
  })
})
