import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { tokenMapToListWithLogo } from './tokenMapToListWithLogo'

const CHAIN_ID = SupportedChainId.SOLANA
const ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const OTHER_ADDRESS = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
const token: TokenInfo = { chainId: CHAIN_ID, address: ADDRESS, name: 'USD Coin', decimals: 6, symbol: 'USDC' }

describe('tokenMapToListWithLogo', () => {
  it('keeps current list ranks when a saved token appears first, preserving membership and metadata', () => {
    const saved = { ...token, logoURI: 'saved-logo.png', tags: ['saved'], extensions: { rank: 99 } }
    const curated = { ...token, logoURI: 'list-logo.png', tags: ['curated'], extensions: { rank: 2 } }
    const other = { ...token, address: OTHER_ADDRESS, symbol: 'AAA', extensions: { rank: 3 } }

    const result = tokenMapToListWithLogo(
      [{ [ADDRESS]: saved }, { [ADDRESS]: curated, [OTHER_ADDRESS]: other }],
      CHAIN_ID,
    )

    expect(result.map((entry) => entry.address)).toEqual([OTHER_ADDRESS, ADDRESS])
    expect(result[1]).toMatchObject({ extensions: { rank: 2 }, logoURI: 'saved-logo.png', tags: ['saved', 'curated'] })
  })

  it('fills a missing saved logo and rank from the normal list', () => {
    const curated = { ...token, logoURI: 'list-logo.png', extensions: { rank: 2 } }

    const result = tokenMapToListWithLogo([{ [ADDRESS]: token }, { [ADDRESS]: curated }], CHAIN_ID)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ extensions: { rank: 2 }, logoURI: 'list-logo.png' })
  })

  it('does not reuse a saved rank when the current list no longer supplies one', () => {
    const saved = { ...token, extensions: { rank: 2 } }

    const result = tokenMapToListWithLogo([{ [ADDRESS]: saved }, { [ADDRESS]: token }], CHAIN_ID)

    expect(result[0]).not.toMatchObject({ extensions: { rank: 2 } })
  })
})
