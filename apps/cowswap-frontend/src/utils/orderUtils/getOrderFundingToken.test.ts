import { NATIVE_CURRENCIES, USDC, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getOrderFundingToken } from './getOrderFundingToken'

const CHAIN_ID = SupportedChainId.MAINNET
const native = NATIVE_CURRENCIES[CHAIN_ID]
const wrappedNative = WRAPPED_NATIVE_CURRENCIES[CHAIN_ID]
const usdc = USDC[CHAIN_ID]

describe('getOrderFundingToken', () => {
  it('returns the native token for a sponsored native sell', () => {
    const result = getOrderFundingToken(CHAIN_ID, {
      isSponsored: true,
      isNativeSell: true,
      inputToken: wrappedNative,
    })

    expect(result.address).toBe(native.address)
    // The warning naming this token has to say what the user actually holds, not the wrapped token
    // the order sells.
    expect(result.symbol).toBe(native.symbol)
  })

  it('returns the sold token for a sponsored non-native sell', () => {
    const result = getOrderFundingToken(CHAIN_ID, { isSponsored: true, isNativeSell: false, inputToken: usdc })

    expect(result.address).toBe(usdc.address)
    expect(result.symbol).toBe(usdc.symbol)
  })

  it('returns the sold token for a self-paid native sell', () => {
    const result = getOrderFundingToken(CHAIN_ID, { isNativeSell: true, inputToken: wrappedNative })

    expect(result.address).toBe(wrappedNative.address)
  })

  it('returns the sold token when the order carries no Solana flags', () => {
    const result = getOrderFundingToken(CHAIN_ID, { inputToken: usdc })

    expect(result.address).toBe(usdc.address)
  })
})
