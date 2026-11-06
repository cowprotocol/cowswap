import { getAddressKey } from '@cowprotocol/cow-sdk'

import { combineChainBalances, type ChainBalancesResult, toPositions } from './chainBalances'
import { AAPLX_ARBITRUM, AAPLX_MAINNET } from './fixtures'

const MAINNET_KEY = getAddressKey(AAPLX_MAINNET.address)

function result(overrides: Partial<ChainBalancesResult>): ChainBalancesResult {
  return { data: undefined, error: null, isFetching: false, dataUpdatedAt: 0, ...overrides }
}

describe('toPositions', () => {
  it('keeps the non-zero balances of the tokens, by chain and address', () => {
    expect(
      toPositions([AAPLX_MAINNET, AAPLX_ARBITRUM], {
        1: { [MAINNET_KEY]: '5' },
        42161: { [MAINNET_KEY]: '0' },
      }),
    ).toEqual([{ token: AAPLX_MAINNET, balance: '5' }])
  })
})

describe('combineChainBalances', () => {
  const tokens = [AAPLX_MAINNET, AAPLX_ARBITRUM]

  it('has no positions until every chain loaded or failed, and counts the settled chains', () => {
    const balances = combineChainBalances(
      tokens,
      [1, 42161],
      [result({ data: { [MAINNET_KEY]: '5' }, dataUpdatedAt: 1000 }), result({ isFetching: true })],
    )

    expect(balances).toMatchObject({ positions: null, loadedChains: 1, totalChains: 2, isFetching: true })
  })

  it('reports the failed chains and the oldest update once every chain settled', () => {
    const balances = combineChainBalances(
      tokens,
      [1, 42161],
      [result({ data: { [MAINNET_KEY]: '5' }, dataUpdatedAt: 2000 }), result({ error: new Error('down') })],
    )

    expect(balances).toEqual({
      positions: [{ token: AAPLX_MAINNET, balance: '5' }],
      error: new Error('down'),
      failedChainIds: [42161],
      loadedChains: 2,
      totalChains: 2,
      isFetching: false,
      updatedAt: 2000,
    })
  })

  it('keeps the previous positions while a refresh is running and counts only the chains it finished', () => {
    const balances = combineChainBalances(
      tokens,
      [1, 42161],
      [
        result({ data: { [MAINNET_KEY]: '5' }, dataUpdatedAt: 2000, isFetching: true }),
        result({ data: {}, dataUpdatedAt: 2000 }),
      ],
    )

    expect(balances).toMatchObject({
      positions: [{ token: AAPLX_MAINNET, balance: '5' }],
      loadedChains: 1,
      isFetching: true,
    })
  })

  it('counts a chain that failed after loading once as failed', () => {
    const balances = combineChainBalances(
      tokens,
      [1],
      [result({ data: { [MAINNET_KEY]: '5' }, dataUpdatedAt: 2000, error: new Error('down') })],
    )

    expect(balances.failedChainIds).toEqual([1])
    expect(balances.positions).toEqual([{ token: AAPLX_MAINNET, balance: '5' }])
  })
})
