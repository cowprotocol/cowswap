import { createStore } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { tokensByAddressAtom, tokensBySymbolAtom } from './allTokensAtom'
import { addUserTokenAtom } from './userAddedTokensAtom'

const TOKEN_ADDRESS = '0x00000000000000000000000000000000000000e1'

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
