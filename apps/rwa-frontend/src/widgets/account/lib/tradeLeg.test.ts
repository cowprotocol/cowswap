import { AAPLX_ARBITRUM, AAPLX_MAINNET, USDC } from './fixtures'
import { getSupportedChainIds, settleChains, toTradeLeg } from './tradeLeg'

const TOKENS = [AAPLX_MAINNET, AAPLX_ARBITRUM]

describe('toTradeLeg', () => {
  it('reads a swap into an asset token as a buy', () => {
    const leg = toTradeLeg(1, TOKENS, {
      sellToken: USDC,
      sellAmount: '230000000',
      buyToken: AAPLX_MAINNET.address.toUpperCase().replace('0X', '0x'),
      buyAmount: '1000000000000000000',
    })

    expect(leg).toEqual({
      chainId: 1,
      side: 'buy',
      assetToken: AAPLX_MAINNET,
      assetAmount: '1000000000000000000',
      counterTokenAddress: USDC,
      counterToken: null,
      counterAmount: '230000000',
    })
  })

  it('reads a swap out of an asset token as a sell', () => {
    const leg = toTradeLeg(42161, TOKENS, {
      sellToken: AAPLX_ARBITRUM.address,
      sellAmount: '5',
      buyToken: USDC,
      buyAmount: '7',
    })

    expect(leg).toMatchObject({ side: 'sell', assetToken: AAPLX_ARBITRUM, assetAmount: '5', counterAmount: '7' })
  })

  it('skips swaps without asset tokens on that chain', () => {
    expect(
      toTradeLeg(56, TOKENS, { sellToken: USDC, sellAmount: '1', buyToken: AAPLX_MAINNET.address, buyAmount: '1' }),
    ).toBe(null)
  })
})

describe('getSupportedChainIds', () => {
  it('returns the unique CoW Protocol chains of the tokens', () => {
    expect(getSupportedChainIds([...TOKENS, AAPLX_MAINNET, { ...AAPLX_MAINNET, chainId: 999999 }])).toEqual([1, 42161])
  })
})

describe('settleChains', () => {
  it('keeps the chains that succeeded', async () => {
    const result = await settleChains([1, 42161], async (chainId) => {
      if (chainId === 1) throw new Error('down')

      return [chainId]
    })

    expect(result).toEqual([42161])
  })

  it('rejects when every chain failed', async () => {
    await expect(settleChains([1], () => Promise.reject(new Error('down')))).rejects.toThrow('down')
  })
})
