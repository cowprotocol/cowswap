import { createStore } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { areAddressesEqual, SupportedChainId } from '@cowprotocol/cow-sdk'

import { allActiveTokensAtom, tokensByAddressAtom, tokensBySymbolAtom } from './allTokensAtom'
import { favoriteTokensAtom } from './favoriteTokensAtom'
import { addUserTokenAtom, userAddedTokensAtom } from './userAddedTokensAtom'

import { updateEnvironmentAtom } from '../environmentAtom'
import { virtualListsStateAtom } from '../tokenLists/tokenListsStateAtom'

const TOKEN_ADDRESS = '0x00000000000000000000000000000000000000e1'
const SOLANA_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

describe('allActiveTokensAtom', () => {
  it.each(['favorite', 'user-added'] as const)(
    'ignores a stale rank on a saved %s outside the active list',
    async (source) => {
      const store = createStore()
      const chainId = SupportedChainId.SOLANA
      const saved = new TokenWithLogo('saved-logo.png', chainId, SOLANA_ADDRESS, 6, 'USDC', 'USD Coin', ['saved'], {
        rank: 1,
        isToken2022: true,
      })
      store.set(updateEnvironmentAtom, { chainId, hideFavoriteTokens: source === 'user-added' })
      const savedAtom = source === 'favorite' ? favoriteTokensAtom : userAddedTokensAtom
      store.set(savedAtom, { ...store.get(savedAtom), [chainId]: { [SOLANA_ADDRESS]: saved } })

      const { tokens } = await store.get(allActiveTokensAtom)
      const result = tokens.find((token) => areAddressesEqual(token.address, SOLANA_ADDRESS))

      expect(result).toMatchObject({ logoURI: 'saved-logo.png', tags: expect.arrayContaining(['saved']) })
      expect(result?.extensions?.rank).toBeUndefined()
      expect(result?.extensions?.isToken2022).toBe(true)
      expect(saved.extensions?.rank).toBe(1)
    },
  )

  it.each([2, undefined])('uses the current active-list rank %s for a saved token', async (rank) => {
    const store = createStore()
    const chainId = SupportedChainId.SOLANA
    const saved = new TokenWithLogo('saved-logo.png', chainId, SOLANA_ADDRESS, 6, 'USDC', 'USD Coin', [], { rank: 1 })
    store.set(updateEnvironmentAtom, { chainId, hideFavoriteTokens: true })
    store.set(addUserTokenAtom, [saved])
    store.set(virtualListsStateAtom, {
      'https://example.com/current.json': {
        source: 'https://example.com/current.json',
        isEnabled: true,
        list: {
          name: 'Current list',
          timestamp: '2026-11-04T00:00:00Z',
          version: { major: 1, minor: 0, patch: 0 },
          tokens: [{ ...saved, name: 'USD Coin', symbol: 'USDC', extensions: { rank } }],
        },
      },
    })

    const { tokens } = await store.get(allActiveTokensAtom)
    const result = tokens.find((token) => areAddressesEqual(token.address, SOLANA_ADDRESS))

    expect(result?.extensions?.rank).toBe(rank)
    expect(result?.logoURI).toBe('saved-logo.png')
    expect(saved.extensions?.rank).toBe(1)
  })

  it('preserves saved extension metadata on EVM chains', async () => {
    const store = createStore()
    const chainId = SupportedChainId.MAINNET
    const saved = new TokenWithLogo(undefined, chainId, TOKEN_ADDRESS, 18, 'TEST', 'Test', [], { rank: 1 })
    store.set(updateEnvironmentAtom, { chainId, hideFavoriteTokens: true })
    store.set(addUserTokenAtom, [saved])

    const { tokens } = await store.get(allActiveTokensAtom)

    expect(tokens.find((token) => areAddressesEqual(token.address, TOKEN_ADDRESS))?.extensions).toEqual({ rank: 1 })
  })
})

describe('tokensBySymbolAtom', () => {
  it.each(['__proto__', 'constructor', 'TEST'])('indexes a user-added token with symbol %s', async (symbol) => {
    const store = createStore()
    store.set(addUserTokenAtom, [new TokenWithLogo(undefined, 1, TOKEN_ADDRESS, 18, symbol, 'Token')])

    const { tokens } = await store.get(tokensBySymbolAtom)

    expect(tokens[symbol.toLowerCase()].map((token) => token.address)).toEqual([TOKEN_ADDRESS])
  })

  it.each(['__proto__', 'constructor', 'tostring'])('returns nothing for an unknown symbol %s', async (symbol) => {
    const { tokens } = await createStore().get(tokensBySymbolAtom)

    expect(tokens[symbol]).toBeUndefined()
  })
})

describe('tokensByAddressAtom', () => {
  it.each(['constructor', '__proto__', 'tostring'])('returns nothing for a non-address key %s', async (key) => {
    const { tokens } = await createStore().get(tokensByAddressAtom)

    expect(tokens[key]).toBeUndefined()
  })
})
