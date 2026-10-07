import { createStore } from 'jotai'

import { getAddressKey, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { listsStatesByChainAtom } from './tokenListsStateAtom'
import { xstockTokenAddressesAtom } from './xstockTokenAddressesAtom'

import { XSTOCKS_TOKENS_LIST_SOURCE } from '../../const/tokensLists'
import { ListState, TokenListsByChainState } from '../../types'
import { environmentAtom } from '../environmentAtom'

const CHAIN_ID = SupportedChainId.MAINNET
const XSTOCK_ADDRESS = '0xABCDEF7890123456789012345678901234567890'
const OTHER_LIST_SOURCE = 'https://example.com/tokenlist.json'
const OTHER_ADDRESS = '0x2234567890123456789012345678901234567890'
const REPINNED_XSTOCKS_SOURCE = XSTOCKS_TOKENS_LIST_SOURCE.replace(/\/[0-9a-f]{40}\//, `/${'b'.repeat(40)}/`)

function createListState(source: string, address: string): ListState {
  return {
    source,
    list: {
      name: 'Test list',
      timestamp: '2024-01-01T00:00:00Z',
      version: { major: 1, minor: 0, patch: 0 },
      tokens: [{ chainId: CHAIN_ID, address, name: 'Token', symbol: 'TKN', decimals: 18 }],
    },
  }
}

async function getXstockAddresses(
  chainState: TokenListsByChainState[SupportedChainId],
  excludeRwaLists = false,
): Promise<Set<string>> {
  const store = createStore()

  store.set(environmentAtom, { chainId: CHAIN_ID, excludeRwaLists })
  store.set(listsStatesByChainAtom, { ...mapSupportedNetworks({}), [CHAIN_ID]: chainState })

  return store.get(xstockTokenAddressesAtom)
}

describe('xstockTokenAddressesAtom', () => {
  it('collects xStocks token address keys while RWA lists are excluded', async () => {
    const addresses = await getXstockAddresses(
      {
        [XSTOCKS_TOKENS_LIST_SOURCE]: createListState(XSTOCKS_TOKENS_LIST_SOURCE, XSTOCK_ADDRESS),
        [OTHER_LIST_SOURCE]: createListState(OTHER_LIST_SOURCE, OTHER_ADDRESS),
      },
      true,
    )

    expect([...addresses]).toEqual([getAddressKey(XSTOCK_ADDRESS)])
  })

  it('collects tokens from a re-pinned xStocks list URL', async () => {
    const addresses = await getXstockAddresses({
      [REPINNED_XSTOCKS_SOURCE]: createListState(REPINNED_XSTOCKS_SOURCE, XSTOCK_ADDRESS),
    })

    expect(addresses.has(getAddressKey(XSTOCK_ADDRESS))).toBe(true)
  })

  it('is empty when the xStocks list was deleted', async () => {
    const addresses = await getXstockAddresses({ [XSTOCKS_TOKENS_LIST_SOURCE]: 'deleted' })

    expect(addresses.size).toBe(0)
  })
})
