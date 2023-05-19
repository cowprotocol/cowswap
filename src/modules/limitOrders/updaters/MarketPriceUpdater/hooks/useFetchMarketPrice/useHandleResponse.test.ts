import { OrderKind, OrderQuoteResponse, SigningScheme } from '@cowprotocol/cow-sdk'
import { handleLimitOrderQuoteResponse } from './useHandleResponse'
import { COW, GNO } from 'legacy/constants/tokens'
import { CancelableResult } from 'legacy/utils/async'

describe('handleLimitOrderQuoteResponse()', () => {
  it('Should subtract 0.1% from marketRate', () => {
    const inputCurrency = COW[1]
    const outputCurrency = GNO[1]
    const response: CancelableResult<OrderQuoteResponse> = {
      cancelled: false,
      data: {
        expiration: '',
        id: undefined,
        quote: {
          sellAmount: String(10 * 10 ** 18),
          buyAmount: String(4 * 10 ** 18),
          feeAmount: String(0.3 * 10 ** 18),
          sellToken: inputCurrency.address,
          buyToken: outputCurrency.address,
          appData: '0x',
          kind: OrderKind.SELL,
          partiallyFillable: false,
          validTo: 111,
          buyTokenBalance: undefined,
          receiver: '0x',
          sellTokenBalance: undefined,
          signingScheme: SigningScheme.EIP712,
        },
      },
    }

    const result = handleLimitOrderQuoteResponse(inputCurrency, outputCurrency, response)

    // GIVEN: Sell 10 COW for 4 GNO
    // GIVEN: slippage is 0.1%
    // WHEN: marketRate (without slippage) = 4 / 10 = 0.4
    // THEN: marketRate (with slippage) = 0.4 - (0.4 * 0.1 / 100) = 0.3996

    expect(result?.rateState.marketRate?.toFixed(4)).toBe('0.3996')
  })
})
