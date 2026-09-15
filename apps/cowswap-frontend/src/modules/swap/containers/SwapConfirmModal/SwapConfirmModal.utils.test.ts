import { NATIVE_CURRENCIES, TokenWithLogo, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
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
  const inputAmount = CurrencyAmount.fromRawAmount(native, (oneUnit / 2n).toString())
  const maximumSellAmount = CurrencyAmount.fromRawAmount(wrapped, (oneUnit / 2n).toString())

  it('reads the native balance when selling the native token', () => {
    const balances = {
      [getAddressKey(native.address)]: oneUnit,
      [getAddressKey(wrapped.address)]: 0n,
    }

    expect(getIsBalanceEnough({ inputAmount, maximumSellAmount, balances })).toBe(true)
  })

  it('does not fall back to the wrapped balance when the native balance is too low', () => {
    const balances = {
      [getAddressKey(native.address)]: 0n,
      [getAddressKey(wrapped.address)]: oneUnit,
    }

    expect(getIsBalanceEnough({ inputAmount, maximumSellAmount, balances })).toBe(false)
  })

  it('reads the wrapped balance when selling the wrapped token', () => {
    const balances = {
      [getAddressKey(native.address)]: 0n,
      [getAddressKey(wrapped.address)]: oneUnit,
    }

    const wrappedInput = CurrencyAmount.fromRawAmount(wrapped, (oneUnit / 2n).toString())

    expect(getIsBalanceEnough({ inputAmount: wrappedInput, maximumSellAmount, balances })).toBe(true)
  })

  it('covers the slippage-inclusive maximum, not the raw input amount', () => {
    const balances = { [getAddressKey(native.address)]: oneUnit }
    const aboveBalance = CurrencyAmount.fromRawAmount(wrapped, (oneUnit * 2n).toString())

    expect(getIsBalanceEnough({ inputAmount, maximumSellAmount: aboveBalance, balances })).toBe(false)
  })

  it('falls back to the input amount when there is no maximum sell amount', () => {
    const balances = { [getAddressKey(native.address)]: oneUnit }

    expect(getIsBalanceEnough({ inputAmount, maximumSellAmount: null, balances })).toBe(true)
  })

  it('compares by value when the amount currency uses different decimals', () => {
    const sixDecimals = new TokenWithLogo(undefined, chainId, wrapped.address, 6, 'W6', 'Wrapped six decimals')
    const halfUnitSixDecimals = CurrencyAmount.fromRawAmount(sixDecimals, (10n ** 6n / 2n).toString())

    expect(
      getIsBalanceEnough({
        inputAmount,
        maximumSellAmount: halfUnitSixDecimals,
        balances: { [getAddressKey(native.address)]: oneUnit },
      }),
    ).toBe(true)

    expect(
      getIsBalanceEnough({
        inputAmount,
        maximumSellAmount: halfUnitSixDecimals,
        balances: { [getAddressKey(native.address)]: oneUnit / 4n },
      }),
    ).toBe(false)
  })

  it('treats an exactly matching balance as enough', () => {
    const balances = { [getAddressKey(native.address)]: oneUnit / 2n }

    expect(getIsBalanceEnough({ inputAmount, maximumSellAmount, balances })).toBe(true)
  })

  it('treats a missing balance as zero', () => {
    expect(getIsBalanceEnough({ inputAmount, maximumSellAmount, balances: {} })).toBe(false)
  })

  it('is unknown when there is no input amount', () => {
    const balances = { [getAddressKey(native.address)]: oneUnit }

    expect(getIsBalanceEnough({ inputAmount: null, maximumSellAmount, balances })).toBe(null)
    expect(getIsBalanceEnough({ inputAmount: null, maximumSellAmount: null, balances })).toBe(null)
  })

  it('is unknown when the quoted sell amount is an unrelated currency', () => {
    const balances = { [getAddressKey(native.address)]: oneUnit }
    const unrelated = new TokenWithLogo(
      undefined,
      chainId,
      '0x0000000000000000000000000000000000000dad',
      18,
      'DAD',
      'Unrelated token',
    )
    const unrelatedAmount = CurrencyAmount.fromRawAmount(unrelated, (oneUnit / 2n).toString())

    expect(getIsBalanceEnough({ inputAmount, maximumSellAmount: unrelatedAmount, balances })).toBe(null)
  })

  it('is unknown when the sell token is not native but the quote is in the wrapped one', () => {
    const erc20 = new TokenWithLogo(
      undefined,
      chainId,
      '0x00000000000000000000000000000000000000c0',
      18,
      'COW',
      'Cow token',
    )
    const erc20Input = CurrencyAmount.fromRawAmount(erc20, (oneUnit / 2n).toString())
    const balances = { [getAddressKey(erc20.address)]: oneUnit }

    expect(getIsBalanceEnough({ inputAmount: erc20Input, maximumSellAmount, balances })).toBe(null)
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

  it('disables confirm without an insufficient-balance reason when the balance check is unknown', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      isBalanceEnough: null,
    })

    expect(result).toEqual({
      disableConfirm: true,
      isInsufficientBalance: false,
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
