import { COW, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { getTwapFormState } from './getTwapFormState'

import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'
import { TWAPOrder } from '../../types'

const COW_SEPOLIA = COW[SupportedChainId.SEPOLIA]

const twapOrder: TWAPOrder = {
  sellAmount: CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 10000000),
  buyAmount: CurrencyAmount.fromRawAmount(COW_SEPOLIA, 10000000),
  receiver: '0x00000000000000001',
  numOfParts: 1,
  startTime: 1000000,
  timeInterval: 200,
  span: 0,
  appData: '0x000000',
}

describe('getTwapFormState()', () => {
  describe('When sell fiat amount is under threshold', () => {
    it('And order does NOT have buy amount, then should return null', () => {
      const result = getTwapFormState({
        isSafeApp: true,
        verification: ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER,
        partTime: 1000000,
      })

      expect(result).toEqual(null)
    })
  })
})
