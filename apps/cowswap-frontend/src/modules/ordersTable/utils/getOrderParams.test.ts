import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getOrderParams } from './getOrderParams'

import { ordersMock } from '../test/ordersTable.mock'

function createPartiallyExecutedOrder(
  baseOrder: ParsedOrder,
  params: { sellAmount: string; executedSellAmount: string; executedBuyAmount?: string },
): ParsedOrder {
  const { sellAmount, executedSellAmount, executedBuyAmount = '1' } = params
  const filledAmount = new BigNumber(executedSellAmount)

  return {
    ...baseOrder,
    sellAmount,
    executionData: {
      ...baseOrder.executionData,
      executedSellAmount: JSBI.BigInt(executedSellAmount),
      executedBuyAmount: JSBI.BigInt(executedBuyAmount),
      filledAmount,
      filledPercentage: filledAmount.div(new BigNumber(sellAmount)),
      partiallyFilled: true,
      fullyFilled: false,
    },
  }
}

// TODO: Break down this large function into smaller functions

describe('getOrderParams', () => {
  const BASE_ORDER = ordersMock[0]
  const BASE_BALANCES_AND_ALLOWANCES: BalancesAndAllowances = {
    balances: {
      [BASE_ORDER.inputToken.address.toLowerCase()]: BigInt(BASE_ORDER.sellAmount),
    },
    allowances: {
      [BASE_ORDER.inputToken.address.toLowerCase()]: BigInt(BASE_ORDER.sellAmount),
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
          [order.inputToken.address.toLowerCase()]: BigInt(String(+order.sellAmount * 0.00051)),
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
          [order.inputToken.address.toLowerCase()]: BigInt(String(+order.sellAmount * 0.00049)),
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughBalance).toEqual(false)
    })

    it('should have hasEnoughAllowance true when order is partially fillable and allowance covers full sell amount', () => {
      const order = { ...PARTIALLY_FILLABLE_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = {
        ...BASE_BALANCES_AND_ALLOWANCES,
        allowances: {
          [order.inputToken.address.toLowerCase()]: BigInt(order.sellAmount),
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toEqual(true)
    })
    it('should have hasEnoughAllowance false when order is partially fillable and allowance is below full sell amount', () => {
      const order = { ...PARTIALLY_FILLABLE_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = {
        ...BASE_BALANCES_AND_ALLOWANCES,
        allowances: {
          [order.inputToken.address.toLowerCase()]: BigInt(String(+order.sellAmount * 0.5)),
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toEqual(false)
    })
    it('should have hasEnoughAllowance false when order is partially fillable and allowance is dust only', () => {
      const order = { ...PARTIALLY_FILLABLE_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = {
        ...BASE_BALANCES_AND_ALLOWANCES,
        allowances: {
          [order.inputToken.address.toLowerCase()]: BigInt(String(+order.sellAmount * 0.00049)),
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toEqual(false)
    })

    it('should have hasEnoughAllowance true when partially filled and allowance covers the remainder only', () => {
      const order = createPartiallyExecutedOrder(PARTIALLY_FILLABLE_ORDER, {
        sellAmount: '1000',
        executedSellAmount: '600',
      })
      const balancesAndAllowances: BalancesAndAllowances = {
        ...BASE_BALANCES_AND_ALLOWANCES,
        allowances: {
          [order.inputToken.address.toLowerCase()]: 500n,
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toEqual(true)
    })
    it('should have hasEnoughAllowance false when partially filled and allowance is below the remainder', () => {
      const order = createPartiallyExecutedOrder(PARTIALLY_FILLABLE_ORDER, {
        sellAmount: '1000',
        executedSellAmount: '600',
      })
      const balancesAndAllowances: BalancesAndAllowances = {
        ...BASE_BALANCES_AND_ALLOWANCES,
        allowances: {
          [order.inputToken.address.toLowerCase()]: 300n,
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toEqual(false)
    })
    it('should have hasEnoughAllowance true when partially filled and allowance equals the remainder exactly', () => {
      const order = createPartiallyExecutedOrder(PARTIALLY_FILLABLE_ORDER, {
        sellAmount: '1000',
        executedSellAmount: '600',
      })
      const balancesAndAllowances: BalancesAndAllowances = {
        ...BASE_BALANCES_AND_ALLOWANCES,
        allowances: {
          [order.inputToken.address.toLowerCase()]: 400n,
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toEqual(true)
    })
  })

  describe('missing balances/allowances (not loaded yet)', () => {
    it('should have hasEnoughBalance undefined when the balance is not available', () => {
      const order = { ...BASE_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = {
        balances: {},
        allowances: {
          [order.inputToken.address.toLowerCase()]: BigInt(order.sellAmount),
        },
        isLoading: true,
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughBalance).toBeUndefined()
    })

    it('should have hasEnoughAllowance undefined when the allowance map is missing the token', () => {
      const order = { ...BASE_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = {
        balances: {
          [order.inputToken.address.toLowerCase()]: BigInt(order.sellAmount),
        },
        allowances: {},
        isLoading: true,
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toBeUndefined()
    })

    it('should have hasEnoughAllowance undefined when allowances are not loaded', () => {
      const order = { ...BASE_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = {
        balances: {
          [order.inputToken.address.toLowerCase()]: BigInt(order.sellAmount),
        },
        allowances: undefined,
        isLoading: true,
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toBeUndefined()
    })
  })
})
