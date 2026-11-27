import { USDC, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { getTwapFormState, TwapFormState } from './getTwapFormState'

import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'

const baseParams = {
  // Above SEPOLIA minimum part sell fiat ($10 with 18 decimals)
  sellAmountPartFiat: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.SEPOLIA], 100e18),
  chainId: SupportedChainId.SEPOLIA,
  partTime: 300,
  numberOfPartsValue: 1,
  tradeFormValidationContext: null,
  isTwapEoaEnabled: false,
  isSafeApp: true,
  isSafeViaWc: false,
  isEoa: false,
  isReceiveZeroFromNetworkCosts: false,
} as const

describe('getTwapFormState()', () => {
  it('returns WALLET_NOT_SUPPORTED for a non-Safe wallet', () => {
    const result = getTwapFormState({
      ...baseParams,
      isSafeApp: false,
      isEoa: true,
      isTxBundlingSupported: true,
      verification: ExtensibleFallbackVerification.HAS_NOTHING,
      sellAmountPartFiat: null,
      partTime: undefined,
    })

    expect(result).toEqual(TwapFormState.WALLET_NOT_SUPPORTED)
  })

  it('returns TX_BUNDLING_NOT_SUPPORTED for a Safe without batching support', () => {
    const result = getTwapFormState({
      ...baseParams,
      isTxBundlingSupported: false,
      verification: ExtensibleFallbackVerification.HAS_NOTHING,
      sellAmountPartFiat: null,
      partTime: undefined,
    })

    expect(result).toEqual(TwapFormState.TX_BUNDLING_NOT_SUPPORTED)
  })

  it('returns SELL_AMOUNT_TOO_SMALL when the part sell fiat is under the chain minimum', () => {
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

  it('returns RECEIVE_ZERO_FROM_NETWORK_COSTS when network costs wipe the receive above the fiat minimum', () => {
    const result = getTwapFormState({
      ...baseParams,
      isTxBundlingSupported: true,
      verification: ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER,
      isReceiveZeroFromNetworkCosts: true,
    })

    expect(result).toEqual(TwapFormState.RECEIVE_ZERO_FROM_NETWORK_COSTS)
  })

  it('returns SELL_AMOUNT_TOO_SMALL when network costs wipe a part that is also under the fiat minimum', () => {
    const result = getTwapFormState({
      ...baseParams,
      isTxBundlingSupported: true,
      verification: ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER,
      sellAmountPartFiat: CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 10000000),
      chainId: 1,
      isReceiveZeroFromNetworkCosts: true,
    })

    expect(result).toEqual(TwapFormState.SELL_AMOUNT_TOO_SMALL)
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
        isSafeApp: false,
        isEoa: true,
        isTxBundlingSupported: false,
        verification: null,
        isTwapEoaEnabled: true,
      })

      expect(result).toEqual(null)
    })

    it.each([
      [true, null],
      [false, TwapFormState.TX_BUNDLING_NOT_SUPPORTED],
      [null, TwapFormState.LOADING_SAFE_INFO],
    ] as const)(
      'Checks Safe via WalletConnect batching support (%s) even when EOA flag is on',
      (supported, expected) => {
        const result = getTwapFormState({
          ...baseParams,
          isSafeApp: false,
          isSafeViaWc: true,
          isTxBundlingSupported: supported,
          verification: ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER,
          isTwapEoaEnabled: true,
          isEoa: false,
        })

        expect(result).toEqual(expected)
      },
    )

    it('Keeps Safe guards while wallet support is still loading', () => {
      const result = getTwapFormState({
        ...baseParams,
        isSafeApp: null,
        isTxBundlingSupported: null,
        verification: null,
        isTwapEoaEnabled: true,
      })

      expect(result).toEqual(TwapFormState.LOADING_SAFE_INFO)
    })
  })
})
