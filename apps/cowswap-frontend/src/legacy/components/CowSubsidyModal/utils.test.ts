import { formatUnits } from 'viem'

import { getDiscountFromBalance } from './utils'

const BALANCES_IN_TIER = [
  { balance: 0n, tier: 0 },
  // TODO: Revert back the tiers if ever enabled again
  { balance: 100000000000000000n, tier: 0 }, // 0.1
  { balance: 999990000000000000000n, tier: 0 }, // 999.99
  { balance: 1000000000000000000000n, tier: 0 }, // 1,000
  { balance: 9999990000000000000000n, tier: 0 }, // 9,999.99
  { balance: 10000000000000000000000n, tier: 0 }, // 10,000
  { balance: 99999990000000000000000n, tier: 0 }, // 99,999.99
  { balance: 110000000000000000000000n, tier: 0 }, // 110,000
  { balance: 999999990000000000000000n, tier: 0 }, // 999,999.99
  { balance: 1743300000000000000000000n, tier: 0 }, // 1,743,300
  { balance: 99999999990000000000000000n, tier: 0 }, // 99,999,999.99
]

const INCORRECT_BALANCES_IN_TIER = [
  { balance: 0n, tier: 1 },
  { balance: 100000000000000000n, tier: 1 }, // 0.1
  { balance: 999990000000000000000n, tier: 1 }, // 999.99
  { balance: 1000000000000000000000n, tier: 3 }, // 1,000
  { balance: 9999990000000000000000n, tier: 2 }, // 9,999.99
  { balance: 10000000000000000000000n, tier: 1 }, // 10,000
  { balance: 99999990000000000000000n, tier: 3 }, // 99,999.99
  { balance: 110000000000000000000000n, tier: 2 }, // 110,000
  { balance: 999999990000000000000000n, tier: 4 }, // 999,999.99
  { balance: 1743300000000000000000000n, tier: 3 }, // 1,743,300
  { balance: 99999999990000000000000000n, tier: 5 }, // 99,999,999.99
]

describe('FEE DISCOUNT TIERS', () => {
  describe('CORRECT DISCOUNTS', () => {
    BALANCES_IN_TIER.forEach(({ balance, tier }) => {
      it(`USER BALANCE: [${formatUnits(balance, 18)}] equals TIER ${tier}`, () => {
        expect(getDiscountFromBalance(balance).tier).toEqual(tier)
      })
    })
  })
  describe('INCORRECT DISCOUNTS', () => {
    INCORRECT_BALANCES_IN_TIER.forEach(({ balance, tier }) => {
      it(`USER BALANCE: [${formatUnits(balance, 18)}] does NOT equal TIER ${tier}`, () => {
        expect(getDiscountFromBalance(balance).tier).not.toEqual(tier)
      })
    })
  })
})
