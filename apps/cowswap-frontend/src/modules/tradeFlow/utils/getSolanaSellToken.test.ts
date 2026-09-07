import { NATIVE_CURRENCIES, TokenWithLogo, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { getSolanaSellToken } from './getSolanaSellToken'

const usdc = new TokenWithLogo(
  undefined,
  SupportedChainId.SOLANA,
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  6,
  'USDC',
  'USD Coin',
)

describe('getSolanaSellToken', () => {
  it('resolves native SOL to WSOL, which is what the wrap step produces', () => {
    const result = getSolanaSellToken(NATIVE_CURRENCIES[SupportedChainId.SOLANA])

    expect(result).toBe(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA])
  })

  it('returns an SPL token as-is', () => {
    expect(getSolanaSellToken(usdc)).toBe(usdc)
  })

  it('returns undefined when there is no input currency', () => {
    expect(getSolanaSellToken(undefined)).toBeUndefined()
    expect(getSolanaSellToken(null)).toBeUndefined()
  })

  it('returns undefined for a token that carries no list metadata', () => {
    // The delegate step needs `tags` to detect Token-2022, so a bare Token can't be used.
    const bare = new Token(SupportedChainId.SOLANA, 'So11111111111111111111111111111111111111112', 9, 'WSOL')

    expect(getSolanaSellToken(bare)).toBeUndefined()
  })
})
