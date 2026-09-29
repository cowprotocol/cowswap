import { TokenInfo } from '@cowprotocol/types'

import { normalizeTokensMapKeys } from './normalizeTokensMapKeys'

const SOLANA_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const EVM_ADDRESS = '0xf164fc0ec4e93095b804a4795bbe1e041497b92a'

function token(address: string): TokenInfo {
  return { address, chainId: 1, decimals: 6, symbol: 'X', name: 'X' } as TokenInfo
}

describe('normalizeTokensMapKeys', () => {
  it('lowercases EVM address keys', () => {
    const upperCaseAddress = '0x' + EVM_ADDRESS.slice(2).toUpperCase()
    const result = normalizeTokensMapKeys({ [upperCaseAddress]: token(EVM_ADDRESS) })

    expect(Object.keys(result)).toEqual([EVM_ADDRESS.toLowerCase()])
  })

  it('preserves the case of a Solana address key', () => {
    const result = normalizeTokensMapKeys({ [SOLANA_ADDRESS]: token(SOLANA_ADDRESS) })

    expect(Object.keys(result)).toEqual([SOLANA_ADDRESS])
  })

  it('returns an empty map for a nullish input', () => {
    expect(normalizeTokensMapKeys(undefined as never)).toEqual({})
  })
})
