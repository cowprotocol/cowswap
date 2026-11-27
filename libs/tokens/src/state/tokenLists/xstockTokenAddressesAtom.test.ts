import { createStore } from 'jotai'

import { getAddressKey, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { listsStatesByChainAtom } from './tokenListsStateAtom'
import { xstockTokenAddressesAtom } from './xstockTokenAddressesAtom'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { ListState, TokenListsByChainState } from '../../types'
import { environmentAtom } from '../environmentAtom'

const CHAIN_ID = SupportedChainId.MAINNET
const RWA_LIST_SOURCE = (DEFAULT_TOKENS_LISTS[CHAIN_ID] || []).filter((list) => list.category === 'RWA')[0].source
const OTHER_LIST_SOURCE = 'https://example.com/tokenlist.json'
const XSTOCK_ADDRESS = '0xABCDEF7890123456789012345678901234567890'
const ONDO_ADDRESS = '0x1234567890123456789012345678901234567890'
const OTHER_ADDRESS = '0x2234567890123456789012345678901234567890'

function createListState(source: string, tokens: ListState['list']['tokens']): ListState {
  return {
    source,
    list: {
      name: 'Test list',
      timestamp: '2024-01-01T00:00:00Z',
      version: { major: 1, minor: 0, patch: 0 },
      tokens,
    },
  }
}

async function getXstockAddresses(chainState: TokenListsByChainState[SupportedChainId]): Promise<Set<string>> {
  const store = createStore()

  store.set(environmentAtom, { chainId: CHAIN_ID })
  store.set(listsStatesByChainAtom, { ...mapSupportedNetworks({}), [CHAIN_ID]: chainState })

  return store.get(xstockTokenAddressesAtom)
}

function token(address: string, issuer?: string, chainId: number = CHAIN_ID): ListState['list']['tokens'][number] {
  return {
    chainId,
    address,
    name: 'Token',
    symbol: 'TKN',
    decimals: 18,
    ...(issuer ? { extensions: { issuer } } : {}),
  }
}

describe('xstockTokenAddressesAtom', () => {
  it('collects the RWA list tokens issued by xStocks, and only those', async () => {
    const addresses = await getXstockAddresses({
      [RWA_LIST_SOURCE]: createListState(RWA_LIST_SOURCE, [
        token(XSTOCK_ADDRESS, 'xStocks'),
        token(ONDO_ADDRESS, 'Ondo Finance'),
      ]),
      [OTHER_LIST_SOURCE]: createListState(OTHER_LIST_SOURCE, [token(OTHER_ADDRESS, 'xStocks')]),
    })

    expect([...addresses]).toEqual([getAddressKey(XSTOCK_ADDRESS)])
  })

  it('ignores tokens of another chain', async () => {
    const addresses = await getXstockAddresses({
      [RWA_LIST_SOURCE]: createListState(RWA_LIST_SOURCE, [token(XSTOCK_ADDRESS, 'xStocks', SupportedChainId.BNB)]),
    })

    expect(addresses.size).toBe(0)
  })

  it('is empty when the RWA list was deleted', async () => {
    const addresses = await getXstockAddresses({ [RWA_LIST_SOURCE]: 'deleted' })

    expect(addresses.size).toBe(0)
  })
})
