import { OrderKind, type OrderParameters, type SolanaQuoteCosts } from '@cowprotocol/cow-sdk'

import { getSolanaCostsInSellAtoms } from './getSolanaCostsInSellAtoms'

const SELL_AMOUNT = '20000000'
const BUY_AMOUNT = '1857406'

const COSTS: SolanaQuoteCosts = {
  token: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  networkFees: '904',
  buyTokenAtaCosts: '149387',
  protocolFee: '0',
  total: '150291',
}

const SELL_ORDER = {
  kind: OrderKind.SELL,
  sellAmount: SELL_AMOUNT,
  buyAmount: BUY_AMOUNT,
  feeAmount: '0',
} as OrderParameters

const BUY_ORDER = {
  kind: OrderKind.BUY,
  sellAmount: '21405417',
  buyAmount: '2000000',
  feeAmount: '0',
} as OrderParameters

describe('getSolanaCostsInSellAtoms', () => {
  it('returns no fee when the quote carries no costs', () => {
    expect(getSolanaCostsInSellAtoms(SELL_ORDER, undefined)).toBe(0n)
  })

  it('returns no fee when every cost is zero', () => {
    const costs = { ...COSTS, networkFees: '0', buyTokenAtaCosts: '0', total: '0' }

    expect(getSolanaCostsInSellAtoms(SELL_ORDER, costs)).toBe(0n)
  })

  describe('sell order', () => {
    it('converts the buy-side costs at the rate before costs', () => {
      // 150291 * 20000000 / (1857406 + 150291) = 1497148
      expect(getSolanaCostsInSellAtoms(SELL_ORDER, COSTS)).toBe(1497148n)
    })

    it('charges the same share of the sell amount as the costs take of the gross buy amount', () => {
      const fee = getSolanaCostsInSellAtoms(SELL_ORDER, COSTS)
      const grossBuyAmount = BigInt(BUY_AMOUNT) + 150291n

      expect(Number(fee) / Number(SELL_AMOUNT)).toBeCloseTo(150291 / Number(grossBuyAmount), 6)
    })

    it('ignores the protocol fee, which reaches the amounts through protocolFeeBps', () => {
      const withProtocolFee = { ...COSTS, protocolFee: '500000', total: '650291' }

      expect(getSolanaCostsInSellAtoms(SELL_ORDER, withProtocolFee)).toBe(getSolanaCostsInSellAtoms(SELL_ORDER, COSTS))
    })

    it('returns no fee when the quote has no sell amount to convert against', () => {
      expect(getSolanaCostsInSellAtoms({ ...SELL_ORDER, sellAmount: '0' }, COSTS)).toBe(0n)
    })

    it('returns no fee when the quote has no buy amount to convert against', () => {
      expect(getSolanaCostsInSellAtoms({ ...SELL_ORDER, buyAmount: '0' }, COSTS)).toBe(0n)
    })

    it('treats a malformed amount as absent', () => {
      expect(getSolanaCostsInSellAtoms({ ...SELL_ORDER, sellAmount: 'not-a-number' }, COSTS)).toBe(0n)
      expect(getSolanaCostsInSellAtoms({ ...SELL_ORDER, buyAmount: 'not-a-number' }, COSTS)).toBe(0n)
    })
  })

  describe('buy order', () => {
    it('takes the costs as they are, already denominated in the sell token', () => {
      expect(getSolanaCostsInSellAtoms(BUY_ORDER, { ...COSTS, networkFees: '9001', buyTokenAtaCosts: '1488440' })).toBe(
        1497441n,
      )
    })
  })
})
