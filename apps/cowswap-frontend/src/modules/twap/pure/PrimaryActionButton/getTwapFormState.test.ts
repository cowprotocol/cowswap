import { COW_TOKEN_TO_CHAIN, USDC, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { getTwapFormState, TwapFormState } from './getTwapFormState'

import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'
import { TWAPOrder } from '../../types'

const COW_SEPOLIA = COW_TOKEN_TO_CHAIN[SupportedChainId.SEPOLIA]

if (!COW_SEPOLIA) {
  throw new Error(`COW token not found for chain ${SupportedChainId.SEPOLIA}`)
}

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

const baseParams = {
  twapOrder: { ...twapOrder },
  // Above SEPOLIA minimum part sell fiat ($10 with 18 decimals)
  sellAmountPartFiat: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.SEPOLIA], 100e18),
  chainId: SupportedChainId.SEPOLIA,
  partTime: 300,
  numberOfPartsValue: 1,
  tradeFormValidationContext: null,
  isTwapEoaEnabled: false,
} as const

describe('getTwapFormState()', () => {
  describe('When sell fiat amount is under threshold', () => {
    it('And order has buy amount, then should return SELL_AMOUNT_TOO_SMALL', () => {
      const result = getTwapFormState({
        ...baseParams,
        isTxBundlingSupported: true,
        verification: ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER,
        sellAmountPartFiat: CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 10000000),
        chainId: 1,
        partTime: 1000000,
      })

      expect(result).toEqual(TwapFormState.SELL_AMOUNT_TOO_SMALL)
    })

    it('And order does NOT have buy amount, then should return null', () => {
      const result = getTwapFormState({
        ...baseParams,
        isTxBundlingSupported: true,
        verification: ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER,
        twapOrder: { ...twapOrder, buyAmount: CurrencyAmount.fromRawAmount(COW_SEPOLIA, 0) },
        sellAmountPartFiat: CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 10000000),
        chainId: 1,
        partTime: 1000000,
      })

      expect(result).toEqual(null)
    })
  })

  describe('Safe / tx-bundling guards', () => {
    it('Returns TX_BUNDLING_NOT_SUPPORTED when bundling is unsupported and EOA flag is off', () => {
      const result = getTwapFormState({
        ...baseParams,
        isTxBundlingSupported: false,
        verification: ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER,
        isTwapEoaEnabled: false,
      })

      expect(result).toEqual(TwapFormState.TX_BUNDLING_NOT_SUPPORTED)
    })

    it('Returns LOADING_SAFE_INFO when verification is null and EOA flag is off', () => {
      const result = getTwapFormState({
        ...baseParams,
        isTxBundlingSupported: true,
        verification: null,
        isTwapEoaEnabled: false,
      })

      expect(result).toEqual(TwapFormState.LOADING_SAFE_INFO)
    })

    it('Skips Safe guards when EOA flag is on so unsupported wallets can proceed', () => {
      const result = getTwapFormState({
        ...baseParams,
        isTxBundlingSupported: false,
        verification: null,
        isTwapEoaEnabled: true,
      })

      expect(result).toEqual(null)
    })
  })
})
