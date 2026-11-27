import { createStore, Provider } from 'jotai'
import { ReactNode, Suspense } from 'react'

import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { act, renderHook } from '@testing-library/react'

import { useMarketHoursRwaToken } from './useMarketHoursRwaToken'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { environmentAtom } from '../../state/environmentAtom'
import { RwaToken } from '../../state/tokenLists/rwaTokensAtom'
import { listsStatesByChainAtom } from '../../state/tokenLists/tokenListsStateAtom'

const CHAIN_ID = SupportedChainId.MAINNET
const RWA_LIST_SOURCE = (DEFAULT_TOKENS_LISTS[CHAIN_ID] || []).filter((list) => list.category === 'RWA')[0].source

const STOCK = new Token(CHAIN_ID, '0x1234567890123456789012345678901234567890', 18, 'AMCx')
const ETF = new Token(CHAIN_ID, '0x2234567890123456789012345678901234567890', 18, 'SPYx')
const GOLD = new Token(CHAIN_ID, '0x3234567890123456789012345678901234567890', 18, 'PAXG')
const NOT_RWA = new Token(CHAIN_ID, '0x4234567890123456789012345678901234567890', 6, 'USDC')

function listToken(token: Token, assetType: string): RwaToken {
  return {
    chainId: token.chainId,
    address: token.address,
    name: 'Token',
    symbol: token.symbol || '',
    decimals: token.decimals,
    extensions: { assetType },
  }
}

async function render(firstToken: Token | undefined, secondToken: Token | undefined): Promise<Token | undefined> {
  const store = createStore()

  store.set(environmentAtom, { chainId: CHAIN_ID })
  store.set(listsStatesByChainAtom, {
    ...mapSupportedNetworks({}),
    [CHAIN_ID]: {
      [RWA_LIST_SOURCE]: {
        source: RWA_LIST_SOURCE,
        list: {
          name: 'RWA',
          timestamp: '2024-01-01T00:00:00Z',
          version: { major: 1, minor: 0, patch: 0 },
          tokens: [listToken(STOCK, 'stock'), listToken(ETF, 'etf'), listToken(GOLD, 'commodity')],
        },
      },
    },
  })

  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <Provider store={store}>
      <Suspense fallback={null}>{children}</Suspense>
    </Provider>
  )

  const { result } = await act(async () =>
    renderHook(() => ({ value: useMarketHoursRwaToken(firstToken, secondToken) }), { wrapper }),
  )

  return result.current.value
}

describe('useMarketHoursRwaToken', () => {
  it('returns a tokenized stock', async () => {
    expect(await render(NOT_RWA, STOCK)).toBe(STOCK)
  })

  it('returns a tokenized ETF', async () => {
    expect(await render(ETF, NOT_RWA)).toBe(ETF)
  })

  it('ignores RWA tokens that are not traded on market hours', async () => {
    expect(await render(GOLD, NOT_RWA)).toBeUndefined()
  })
})
