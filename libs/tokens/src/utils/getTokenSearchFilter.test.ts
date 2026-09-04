import { Token } from '@cowprotocol/currency'

import { getTokenSearchFilter } from './getTokenSearchFilter'

const SOLANA_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const EVM_ADDRESS = '0xf164fc0ec4e93095b804a4795bbe1e041497b92a'

function token(address: string, symbol: string): Token {
  return new Token(1, address, 6, symbol, symbol)
}

describe('getTokenSearchFilter', () => {
  it('matches a Solana address query against the same address', () => {
    const filter = getTokenSearchFilter(SOLANA_ADDRESS)

    expect(filter(token(SOLANA_ADDRESS, 'USDC'))).toBe(true)
    expect(filter(token(EVM_ADDRESS, 'DAI'))).toBe(false)
  })

  it('matches an EVM address query pasted without the 0x prefix', () => {
    const filter = getTokenSearchFilter(EVM_ADDRESS.slice(2))

    expect(filter(token(EVM_ADDRESS, 'DAI'))).toBe(true)
  })

  it('falls back to symbol/name matching for a non-address query', () => {
    const filter = getTokenSearchFilter('usdc')

    expect(filter(token(EVM_ADDRESS, 'USDC'))).toBe(true)
    expect(filter(token(SOLANA_ADDRESS, 'DAI'))).toBe(false)
  })
})
