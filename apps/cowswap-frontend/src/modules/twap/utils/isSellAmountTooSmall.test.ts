import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { isPartSellAmountTooSmall } from './isSellAmountTooSmall'

import { MINIMUM_PART_SELL_AMOUNT_FIAT } from '../const'

const chainId = SupportedChainId.MAINNET
const minimum = MINIMUM_PART_SELL_AMOUNT_FIAT[chainId]

describe('isPartSellAmountTooSmall', () => {
  const total = minimum.multiply(11)

  it('allows part counts that keep each part at or above the minimum', () => {
    expect(isPartSellAmountTooSmall(total, 10, chainId)).toBe(false)
    expect(isPartSellAmountTooSmall(total, 11, chainId)).toBe(false)
  })

  it('rejects part counts that push each part below the minimum', () => {
    expect(isPartSellAmountTooSmall(total, 12, chainId)).toBe(true)
  })

  it('does not reject when the total or the chain is unknown', () => {
    expect(isPartSellAmountTooSmall(null, 12, chainId)).toBe(false)
    expect(isPartSellAmountTooSmall(total, 12, undefined)).toBe(false)
  })

  it('does not reject invalid part counts', () => {
    expect(isPartSellAmountTooSmall(total, 0, chainId)).toBe(false)
    expect(isPartSellAmountTooSmall(total, 1.5, chainId)).toBe(false)
  })
})
