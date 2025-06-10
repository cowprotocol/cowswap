import { BigNumber } from '@ethersproject/bignumber'

import { BalancesAndAllowances } from 'modules/tokens'

import { getOrderParams } from './getOrderParams'

import { ordersMock } from '../pure/OrdersTableContainer/orders.mock'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('getOrderParams', () => {
  const BASE_ORDER = ordersMock[0]
  const BASE_BALANCES_AND_ALLOWANCES: BalancesAndAllowances = {
    balances: {
      [BASE_ORDER.inputToken.address.toLowerCase()]: BigNumber.from(BASE_ORDER.sellAmount),
    },
    allowances: {
      [BASE_ORDER.inputToken.address.toLowerCase()]: BigNumber.from(BASE_ORDER.sellAmount),
    },
    isLoading: false,
  }

  describe('fill or kill', () => {
    const FILL_OR_KILL_ORDER = {
      ...BASE_ORDER,
      partiallyFillable: false,
    }
    it('should have hasEnoughBalance true when order is fill or kill and balance is sufficient', () => {
      const order = { ...FILL_OR_KILL_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = { ...BASE_BALANCES_AND_ALLOWANCES }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughBalance).toEqual(true)
    })

    it('should have hasEnoughBalance false when order is fill or kill and balance is insufficient', () => {
      const order = {
        ...FILL_OR_KILL_ORDER,
        sellAmount: String(+FILL_OR_KILL_ORDER.sellAmount + 1),
      }
      const balancesAndAllowances: BalancesAndAllowances = { ...BASE_BALANCES_AND_ALLOWANCES }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughBalance).toEqual(false)
    })

    it('should have hasEnoughAllowance true when order is fill or kill and allowance is sufficient', () => {
      const order = { ...FILL_OR_KILL_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = { ...BASE_BALANCES_AND_ALLOWANCES }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toEqual(true)
    })
    it('should have hasEnoughAllowance false when order is fill or kill and allowance is insufficient', () => {
      const order = {
        ...FILL_OR_KILL_ORDER,
        sellAmount: String(+FILL_OR_KILL_ORDER.sellAmount + 1),
      }
      const balancesAndAllowances: BalancesAndAllowances = { ...BASE_BALANCES_AND_ALLOWANCES }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toEqual(false)
    })
  })

  describe('partially fillable', () => {
    const PARTIALLY_FILLABLE_ORDER = {
      ...BASE_ORDER,
      partiallyFillable: true,
    }
    it('should have hasEnoughBalance true when order is partially fillable and balance is > 0.05%', () => {
      const order = { ...PARTIALLY_FILLABLE_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = {
        ...BASE_BALANCES_AND_ALLOWANCES,
        balances: {
          [order.inputToken.address.toLowerCase()]: BigNumber.from(String(+order.sellAmount * 0.00051)),
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughBalance).toEqual(true)
    })
    it('should have hasEnoughBalance false when order is partially fillable and balance is < 0.05%', () => {
      const order = { ...PARTIALLY_FILLABLE_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = {
        ...BASE_BALANCES_AND_ALLOWANCES,
        balances: {
          [order.inputToken.address.toLowerCase()]: BigNumber.from(String(+order.sellAmount * 0.00049)),
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughBalance).toEqual(false)
    })

    it('should have hasEnoughAllowance true when order is partially fillable and allowance is > 0.05%', () => {
      const order = { ...PARTIALLY_FILLABLE_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = {
        ...BASE_BALANCES_AND_ALLOWANCES,
        allowances: {
          [order.inputToken.address.toLowerCase()]: BigNumber.from(String(+order.sellAmount * 0.00051)),
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toEqual(true)
    })
    it('should have hasEnoughAllowance false when order is partially fillable and allowance is < 0.05%', () => {
      const order = { ...PARTIALLY_FILLABLE_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = {
        ...BASE_BALANCES_AND_ALLOWANCES,
        allowances: {
          [order.inputToken.address.toLowerCase()]: BigNumber.from(String(+order.sellAmount * 0.00049)),
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toEqual(false)
    })
  })
})
