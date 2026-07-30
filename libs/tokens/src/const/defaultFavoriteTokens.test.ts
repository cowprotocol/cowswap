import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_FAVORITE_TOKENS } from './defaultFavoriteTokens'

describe('DEFAULT_FAVORITE_TOKENS', () => {
  describe('Solana', () => {
    const favorites = DEFAULT_FAVORITE_TOKENS[SupportedChainId.SOLANA]

    it('offers SOL and WSOL so the wrap pair is reachable', () => {
      const symbols = Object.values(favorites).map((token) => token.symbol)

      expect(symbols).toEqual(expect.arrayContaining(['SOL', 'WSOL']))
    })

    it('preserves base58 casing in the stored addresses', () => {
      const addresses = Object.values(favorites).map((token) => token.address)

      // Lowercasing a base58 mint yields an address that no Solana RPC can resolve
      expect(addresses).toEqual(
        expect.arrayContaining([
          NATIVE_CURRENCIES[SupportedChainId.SOLANA].address,
          WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address,
        ]),
      )
    })
  })
})
