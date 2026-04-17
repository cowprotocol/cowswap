import { getSwapConfirmDisabledState, GetSwapConfirmDisabledStateParams } from './SwapConfirmModal.utils'

const defaultParams: GetSwapConfirmDisabledStateParams = {
  shouldDisplayBridgeDetails: true,
  hasBridgeQuoteAmounts: true,
  hasCurrentCurrency: true,
  isBalanceEnough: true,
  isQuoteLoading: false,
  quoteCounter: 15000,
  isQuoteStale: false,
}

describe('getSwapConfirmDisabledState', () => {
  it('disables confirm when bridge quote is refreshing', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      quoteCounter: 0,
    })

    expect(result).toEqual({
      disableConfirm: true,
      isInsufficientBalance: false,
    })
  })

  it('disables confirm when bridge quote is stale', () => {
    const result = getSwapConfirmDisabledState({
      ...defaultParams,
      isQuoteStale: true,
    })

    expect(result).toEqual({
      disableConfirm: true,
      isInsufficientBalance: false,
    })
  })

  it('disables confirm when bridge quote is loading', () => {
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
})
