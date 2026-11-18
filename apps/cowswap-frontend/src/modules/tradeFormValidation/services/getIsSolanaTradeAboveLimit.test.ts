import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { getIsSolanaTradeAboveLimit } from './getIsSolanaTradeAboveLimit'

import { TradeFormValidationContext } from '../types'

const mockCurrencyAmount = (value: string): CurrencyAmount<Currency> =>
  ({ toExact: () => value }) as unknown as CurrencyAmount<Currency>

const buildContext = (isSolanaPublicLaunched: boolean): TradeFormValidationContext =>
  ({
    isSolanaPublicLaunched,
    derivedTradeState: {
      orderKind: 'sell',
      inputCurrency: { chainId: SupportedChainId.SOLANA } as unknown as Currency,
      inputCurrencyFiatAmount: mockCurrencyAmount('25000'),
      outputCurrencyFiatAmount: mockCurrencyAmount('24990'),
    },
  }) as unknown as TradeFormValidationContext

describe('getIsSolanaTradeAboveLimit', () => {
  it('reports a trade over the alpha limit', () => {
    expect(getIsSolanaTradeAboveLimit(buildContext(false))).toBe(true)
  })

  it('reports no limit once Solana is publicly launched', () => {
    expect(getIsSolanaTradeAboveLimit(buildContext(true))).toBe(false)
  })
})
