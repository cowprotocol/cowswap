import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import {
  getIsBalanceEnough,
  getSwapConfirmDisabledState,
  GetSwapConfirmDisabledStateParams,
} from './SwapConfirmModal.utils'

const defaultParams: GetSwapConfirmDisabledStateParams = {
  isTradeContextReady: true,
  shouldDisplayBridgeDetails: true,
  hasBridgeQuoteAmounts: true,
  hasCurrentCurrency: true,
  isBalanceEnough: true,
  isQuoteLoading: false,
  quoteCounter: 15000,
  isQuoteStale: false,
}

describe('getIsBalanceEnough', () => {
  const chainId = SupportedChainId.GNOSIS_CHAIN
  const native = NATIVE_CURRENCIES[chainId]
  const wrapped = WRAPPED_NATIVE_CURRENCIES[chainId]

  const oneUnit = 10n ** BigInt(native.decimals)
  // The quote is always denominated in the wrapped token, even when the user sells the native one
  const maximumSellAmount = CurrencyAmount.fromRawAmount(wrapped, (oneUnit / 2n).toString())

  it('reads the native balance when selling the native token', () => {
    const balances = {
      [getAddressKey(native.address)]: oneUnit,
      [getAddressKey(wrapped.address)]: 0n,
    }

    expect(getIsBalanceEnough({ sellCurrency: native, maximumSellAmount, balances })).toBe(true)
  })

  it('does not fall back to the wrapped balance when the native balance is too low', () => {
    const balances = {
      [getAddressKey(native.address)]: 0n,
      [getAddressKey(wrapped.address)]: oneUnit,
    }

    expect(getIsBalanceEnough({ sellCurrency: native, maximumSellAmount, balances })).toBe(false)
  })

  it('reads the wrapped balance when selling the wrapped token', () => {
    const balances = {
      [getAddressKey(native.address)]: 0n,
      [getAddressKey(wrapped.address)]: oneUnit,
    }

    expect(getIsBalanceEnough({ sellCurrency: wrapped, maximumSellAmount, balances })).toBe(true)
  })

  it('treats an exactly matching balance as enough', () => {
    const balances = { [getAddressKey(native.address)]: oneUnit / 2n }

    expect(getIsBalanceEnough({ sellCurrency: native, maximumSellAmount, balances })).toBe(true)
  })

  it('treats a missing balance as zero', () => {
    expect(getIsBalanceEnough({ sellCurrency: native, maximumSellAmount, balances: {} })).toBe(false)
  })

  it('is not enough when there is no sell currency or no maximum sell amount', () => {
    const balances = { [getAddressKey(native.address)]: oneUnit }

    expect(getIsBalanceEnough({ sellCurrency: null, maximumSellAmount, balances })).toBe(false)
    expect(getIsBalanceEnough({ sellCurrency: native, maximumSellAmount: null, balances })).toBe(false)
  })
})

describe('getSwapConfirmDisabledState', () => {
  it('disables confirm when quote is refreshing', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      quoteCounter: 0,
    })

    expect(result).toEqual({
      disableConfirm: true,
      isInsufficientBalance: false,
    })
  })

  it('disables confirm when quote is stale', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      isQuoteStale: true,
    })

    expect(result).toEqual({
      disableConfirm: true,
      isInsufficientBalance: false,
    })
  })

  it('disables confirm when quote is loading', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      isQuoteLoading: true,
    })

    expect(result).toEqual({
      disableConfirm: true,
      isInsufficientBalance: false,
    })
  })

  it('disables confirm when bridge details are shown but quote amounts are missing', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      hasBridgeQuoteAmounts: false,
    })

    expect(result).toEqual({
      disableConfirm: true,
      isInsufficientBalance: false,
    })
  })

  it('disables confirm with insufficient-balance reason when balance is not enough', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      isBalanceEnough: false,
    })

    expect(result).toEqual({
      disableConfirm: true,
      isInsufficientBalance: true,
    })
  })

  it('enables confirm when quote is valid and balance is enough', () => {
    const result = getSwapConfirmDisabledState(defaultParams)

    expect(result).toEqual({
      disableConfirm: false,
      isInsufficientBalance: false,
    })
  })

  it('disables confirm for swap quote refresh without bridge details', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      shouldDisplayBridgeDetails: false,
      quoteCounter: 0,
    })

    expect(result).toEqual({
      disableConfirm: true,
      isInsufficientBalance: false,
    })
  })

  it('disables confirm for stale swap quote without bridge details', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      shouldDisplayBridgeDetails: false,
      isQuoteStale: true,
    })

    expect(result).toEqual({
      disableConfirm: true,
      isInsufficientBalance: false,
    })
  })

  it('disables confirm when trade context is not ready', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      isTradeContextReady: false,
    })

    expect(result).toEqual({
      disableConfirm: true,
      isInsufficientBalance: false,
    })
  })

  it('does not require bridge quote amounts for plain swap', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      shouldDisplayBridgeDetails: false,
      hasBridgeQuoteAmounts: false,
    })

    expect(result).toEqual({
      disableConfirm: false,
      isInsufficientBalance: false,
    })
  })
})
