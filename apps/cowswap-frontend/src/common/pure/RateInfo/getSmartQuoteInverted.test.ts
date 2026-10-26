import { NATIVE_CURRENCIES, USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getSmartQuoteInverted } from './getSmartQuoteInverted'

const NATIVE_ETH = NATIVE_CURRENCIES[SupportedChainId.MAINNET]
const NATIVE_ETH_ADDRESS = getCurrencyAddress(NATIVE_ETH)
const USDC_ADDRESS = getCurrencyAddress(USDC_MAINNET)
const WETH_ADDRESS = getCurrencyAddress(WETH_MAINNET)

describe('getSmartQuoteInverted', () => {
  it('returns null when quote or input address is missing', () => {
    expect(getSmartQuoteInverted(undefined, USDC_ADDRESS, false)).toBeNull()
    expect(getSmartQuoteInverted(USDC_ADDRESS, undefined, false)).toBeNull()
  })

  it('does not invert when native ETH is the sell token', () => {
    expect(getSmartQuoteInverted(NATIVE_ETH_ADDRESS, NATIVE_ETH_ADDRESS, true)).toBe(false)
  })

  it('does not invert when native ETH is the quote token', () => {
    expect(getSmartQuoteInverted(NATIVE_ETH_ADDRESS, USDC_ADDRESS, true)).toBe(false)
  })

  it('does not invert when the quote token is the sell token', () => {
    expect(getSmartQuoteInverted(WETH_ADDRESS, WETH_ADDRESS, false)).toBe(false)
  })

  it('inverts when the quote token is the buy token', () => {
    expect(getSmartQuoteInverted(WETH_ADDRESS, USDC_ADDRESS, false)).toBe(true)
  })
})
