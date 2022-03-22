/**
 * @jest-environment ./custom-test-env.js
 */
import { BigNumber } from 'bignumber.js'
import { formatUnits } from '@ethersproject/units'
import { getDiscountFromBalance } from './utils'

const BALANCES_IN_TIER = [
  { balance: '0', tier: 0 },
  { balance: '100000000000000000', tier: 0 }, // 0.1
  { balance: '99990000000000000000', tier: 0 }, // 99.99
  { balance: '100000000000000000000', tier: 1 }, // 100
  { balance: '100001000000000000000', tier: 1 }, // 100.001
  { balance: '1500000000000000000000', tier: 2 }, // 1500
  { balance: '11000000000000000000000', tier: 3 }, // 11000
  { balance: '174330000000000000000000', tier: 4 }, // 174330
]

const INCORRECT_BALANCES_IN_TIER = [
  { balance: '0', tier: 2 },
  { balance: '100000000000000000', tier: 4 }, // 0.1
  { balance: '99990000000000000000', tier: 2 }, // 99.99
  { balance: '100000000000000000000', tier: 2 }, // 100
  { balance: '150000000000000000000', tier: 0 }, // 150
  { balance: '1500000000000000000000', tier: 4 }, // 1500
  { balance: '174330000000000000000000', tier: 3 }, // 174330
]

describe('FEE DISCOUNT TIERS', () => {
  describe('CORRECT DISCOUNTS', () => {
    BALANCES_IN_TIER.forEach(({ balance, tier }) => {
      it(`USER BALANCE: [${formatUnits(balance, 18)}] equals TIER ${tier}`, () => {
        const BALANCE_BN = new BigNumber(balance)

        expect(getDiscountFromBalance(BALANCE_BN).tier).toEqual(tier)
      })
    })
  })
  describe('INCORRECT DISCOUNTS', () => {
    INCORRECT_BALANCES_IN_TIER.forEach(({ balance, tier }) => {
      it(`USER BALANCE: [${formatUnits(balance, 18)}] does NOT equal TIER ${tier}`, () => {
        const BALANCE_BN = new BigNumber(balance)
        expect(getDiscountFromBalance(BALANCE_BN).tier).not.toEqual(tier)
      })
    })
  })
})
