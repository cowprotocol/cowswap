import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { getIsSolanaSellUsdValueUnknown } from './getIsSolanaSellUsdValueUnknown'

import { TradeFormValidationContext } from '../types'

const buildContext = (isSolanaPublicLaunched: boolean): TradeFormValidationContext =>
  ({
    isSolanaPublicLaunched,
    derivedTradeState: {
      inputCurrency: { chainId: SupportedChainId.SOLANA } as unknown as Currency,
      inputCurrencyAmount: {} as unknown as CurrencyAmount<Currency>,
      inputCurrencyFiatAmount: null,
    },
  }) as unknown as TradeFormValidationContext

describe('getIsSolanaSellUsdValueUnknown', () => {
  it('reports an unknown USD value during the alpha launch', () => {
    expect(getIsSolanaSellUsdValueUnknown(buildContext(false))).toBe(true)
  })

  it('reports nothing once Solana is publicly launched', () => {
    expect(getIsSolanaSellUsdValueUnknown(buildContext(true))).toBe(false)
  })
})
