import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getSwapErrorMessage, USER_SWAP_REJECTED_ERROR } from './getSwapErrorMessage'

const insufficientFundsError = { message: 'insufficient funds for gas * price + value: address 0x123 have 1 want 2' }

describe('getSwapErrorMessage', () => {
  it('uses the ETH symbol for an insufficient-funds error on mainnet', () => {
    const message = getSwapErrorMessage(insufficientFundsError as unknown as Error, SupportedChainId.MAINNET)

    expect(message).toContain(NATIVE_CURRENCIES[SupportedChainId.MAINNET].symbol)
  })

  it('uses the chain-specific native symbol for an insufficient-funds error on a non-ETH chain', () => {
    const message = getSwapErrorMessage(insufficientFundsError as unknown as Error, SupportedChainId.GNOSIS_CHAIN)

    const gnosisSymbol = NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN].symbol
    expect(message).toContain(gnosisSymbol)
    expect(gnosisSymbol).not.toBe(NATIVE_CURRENCIES[SupportedChainId.MAINNET].symbol)
    expect(message).not.toContain(NATIVE_CURRENCIES[SupportedChainId.MAINNET].symbol)
  })

  it('returns USER_SWAP_REJECTED_ERROR for a rejected signature regardless of chain', () => {
    const rejectedError = { code: 4001, message: 'User rejected the request' }

    expect(getSwapErrorMessage(rejectedError as unknown as Error, SupportedChainId.MAINNET)).toBe(
      USER_SWAP_REJECTED_ERROR,
    )
    expect(getSwapErrorMessage(rejectedError as unknown as Error, SupportedChainId.GNOSIS_CHAIN)).toBe(
      USER_SWAP_REJECTED_ERROR,
    )
  })

  it('rejection takes precedence over an insufficient-funds match on the same error', () => {
    // An error that would also match the insufficient-funds heuristics, but carries the
    // standard EIP-1193 rejection code — rejection must win.
    const rejectedButAlsoInsufficientFunds = {
      code: 4001,
      message: 'insufficient funds for gas * price + value',
    }

    expect(getSwapErrorMessage(rejectedButAlsoInsufficientFunds as unknown as Error, SupportedChainId.MAINNET)).toBe(
      USER_SWAP_REJECTED_ERROR,
    )
  })

  it('falls back to the provider message for unrelated errors', () => {
    const genericError = { message: 'Something else went wrong' }

    expect(getSwapErrorMessage(genericError as unknown as Error, SupportedChainId.MAINNET)).toBe(
      'Something else went wrong',
    )
  })
})
