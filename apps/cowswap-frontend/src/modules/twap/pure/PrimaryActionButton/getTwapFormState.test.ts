import { CurrencyAmount } from '@uniswap/sdk-core'

import { COW } from 'legacy/constants/tokens'
import { WETH_GOERLI } from 'legacy/utils/goerli/constants'

import { getTwapFormState, TwapFormState } from './getTwapFormState'

import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'
import { TWAPOrder } from '../../types'

const COW_GOERLI = COW[5]

const twapOrder: TWAPOrder = {
  sellAmount: CurrencyAmount.fromRawAmount(WETH_GOERLI, 10000000),
  buyAmount: CurrencyAmount.fromRawAmount(COW_GOERLI, 10000000),
  receiver: '0x00000000000000001',
  numOfParts: 1,
  startTime: 1000000,
  timeInterval: 200,
  span: 0,
  appData: '0x000000',
}

describe('getTwapFormState()', () => {
  describe('When sell fiat amount is under threshold', () => {
    it('And order has buy amount, then should return SELL_AMOUNT_TOO_SMALL', () => {
      const result = getTwapFormState({
        isSafeApp: true,
        verification: ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER,
        twapOrder: { ...twapOrder },
        sellAmountPartFiat: CurrencyAmount.fromRawAmount(WETH_GOERLI, 10000000),
        chainId: 1,
        partTime: 1000000,
      })

      expect(result).toEqual(TwapFormState.SELL_AMOUNT_TOO_SMALL)
    })

    it('And order does NOT have buy amount, then should return null', () => {
      const result = getTwapFormState({
        isSafeApp: true,
        verification: ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER,
        twapOrder: { ...twapOrder, buyAmount: CurrencyAmount.fromRawAmount(COW_GOERLI, 0) },
        sellAmountPartFiat: CurrencyAmount.fromRawAmount(WETH_GOERLI, 10000000),
        chainId: 1,
        partTime: 1000000,
      })

      expect(result).toEqual(null)
    })
  })
})
