import { TokenInfo } from '@cowprotocol/types'

import { getIsToken2022, TOKEN_2022_TAG, TokenWithLogo } from './types'

const CHAIN_ID = 1000000001
const ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

function tokenInfo(overrides: Partial<TokenInfo> = {}): TokenInfo {
  return { chainId: CHAIN_ID, address: ADDRESS, name: 'Token', decimals: 6, symbol: 'TKN', ...overrides }
}

describe('TokenWithLogo.fromToken Token-2022 tagging', () => {
  it('adds the Token-2022 tag from raw list extensions', () => {
    const rawListToken = { ...tokenInfo(), extensions: { isToken2022: true } } as TokenInfo

    const token = TokenWithLogo.fromToken(rawListToken)

    expect(token.tags).toContain(TOKEN_2022_TAG)
    expect(getIsToken2022(token)).toBe(true)
  })

  it('preserves an existing Token-2022 tag without duplicating it', () => {
    const token = TokenWithLogo.fromToken(tokenInfo({ tags: [TOKEN_2022_TAG] }))

    expect(token.tags.filter((tag) => tag === TOKEN_2022_TAG)).toHaveLength(1)
    expect(getIsToken2022(token)).toBe(true)
  })

  it('adds no Token-2022 tag when the extension is absent', () => {
    const token = TokenWithLogo.fromToken(tokenInfo())

    expect(token.tags).not.toContain(TOKEN_2022_TAG)
    expect(getIsToken2022(token)).toBe(false)
  })
})
