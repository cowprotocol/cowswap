import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@cowprotocol/currency'

import { TradeType } from 'common/modules/tradeNavigation'

import { getIsNativeSellUnsupported } from './getIsNativeSellUnsupported'

const NATIVE_SOL = NATIVE_CURRENCIES[SupportedChainId.SOLANA] as unknown as Currency
const NATIVE_ETH = NATIVE_CURRENCIES[SupportedChainId.MAINNET] as unknown as Currency
const SOLANA_USDC = new Token(SupportedChainId.SOLANA, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC')

describe('getIsNativeSellUnsupported', () => {
  it.each([TradeType.LIMIT_ORDER, TradeType.ADVANCED_ORDERS, TradeType.YIELD])(
    'returns true for a native sell in %s',
    (tradeType) => {
      expect(getIsNativeSellUnsupported(NATIVE_SOL, tradeType)).toBe(true)
      expect(getIsNativeSellUnsupported(NATIVE_ETH, tradeType)).toBe(true)
    },
  )

  it('returns false for a native sell in SWAP', () => {
    expect(getIsNativeSellUnsupported(NATIVE_SOL, TradeType.SWAP)).toBe(false)
    expect(getIsNativeSellUnsupported(NATIVE_ETH, TradeType.SWAP)).toBe(false)
  })

  it('returns false for a non-native sell', () => {
    expect(getIsNativeSellUnsupported(SOLANA_USDC, TradeType.LIMIT_ORDER)).toBe(false)
  })

  it('returns false when the sell token is not set', () => {
    expect(getIsNativeSellUnsupported(null, TradeType.LIMIT_ORDER)).toBe(false)
    expect(getIsNativeSellUnsupported(undefined, TradeType.LIMIT_ORDER)).toBe(false)
  })
})
