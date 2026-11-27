import { COW_TOKEN_TO_CHAIN, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { isReceiveZeroFromNetworkCosts } from './isReceiveZeroFromNetworkCosts'

const COW_SEPOLIA = COW_TOKEN_TO_CHAIN[SupportedChainId.SEPOLIA]

if (!COW_SEPOLIA) {
  throw new Error(`COW token not found for chain ${SupportedChainId.SEPOLIA}`)
}

function receiveInfo(
  quotedBuy: bigint,
  buyAfterNetworkCosts: bigint,
): Parameters<typeof isReceiveZeroFromNetworkCosts>[0] {
  const sellAmount = CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 1n)
  const buy = (amount: bigint): CurrencyAmount<NonNullable<typeof COW_SEPOLIA>> =>
    CurrencyAmount.fromRawAmount(COW_SEPOLIA, amount)

  return {
    isSell: true,
    beforeNetworkCosts: { sellAmount, buyAmount: buy(quotedBuy) },
    afterNetworkCosts: { sellAmount, buyAmount: buy(buyAfterNetworkCosts) },
  }
}

describe('isReceiveZeroFromNetworkCosts', () => {
  it('is false when there is no quote', () => {
    expect(isReceiveZeroFromNetworkCosts(null)).toBe(false)
  })

  it('is false when the quoted buy is already zero', () => {
    expect(isReceiveZeroFromNetworkCosts(receiveInfo(0n, 0n))).toBe(false)
  })

  it('is false when network costs leave a positive buy', () => {
    expect(isReceiveZeroFromNetworkCosts(receiveInfo(100n, 40n))).toBe(false)
  })

  it('is true when network costs wipe a positive quoted buy', () => {
    expect(isReceiveZeroFromNetworkCosts(receiveInfo(100n, 0n))).toBe(true)
  })
})
