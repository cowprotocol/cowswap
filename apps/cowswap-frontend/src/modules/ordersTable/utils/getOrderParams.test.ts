import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'

import { getOrderParams } from './getOrderParams'

import { ordersMock } from '../test/ordersTable.mock'

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

    it('should have hasEnoughAllowance true when order is partially fillable and allowance is > 0.05%', () => {
      const order = { ...PARTIALLY_FILLABLE_ORDER }
      const balancesAndAllowances: BalancesAndAllowances = {
        ...BASE_BALANCES_AND_ALLOWANCES,
        allowances: {
          [order.inputToken.address.toLowerCase()]: BigInt(String(+order.sellAmount * 0.00051)),
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
          [order.inputToken.address.toLowerCase()]: BigInt(String(+order.sellAmount * 0.00049)),
        },
      }
      const result = getOrderParams(1, balancesAndAllowances, order)
      expect(result.hasEnoughAllowance).toEqual(false)
    })
  })

  it('does not check connected-wallet funding for EOA TWAP orders', () => {
    const result = getOrderParams(1, BASE_BALANCES_AND_ALLOWANCES, {
      ...BASE_ORDER,
      isEoaTwapOrder: true,
    })

    expect(result.hasEnoughBalance).toBeUndefined()
    expect(result.hasEnoughAllowance).toBeUndefined()
  })

  describe('EOA TWAP JIT funding', () => {
    const PART_SELL_AMOUNT = '100'
    const EOA_TWAP_ORDER = {
      ...BASE_ORDER,
      isEoaTwapOrder: true,
      partiallyFillable: true,
    }

    function funding(balance?: bigint, allowance?: bigint): BalancesAndAllowances {
      const tokenKey = BASE_ORDER.inputToken.address.toLowerCase()

      return {
        balances: balance === undefined ? {} : { [tokenKey]: balance },
        allowances: allowance === undefined ? {} : { [tokenKey]: allowance },
        isLoading: false,
      }
    }

    it('checks the next part amount instead of the full TWAP amount', () => {
      const result = getOrderParams(1, funding(100n, 100n), EOA_TWAP_ORDER, undefined, PART_SELL_AMOUNT)

      expect(result.hasEnoughBalance).toBe(true)
      expect(result.hasEnoughAllowance).toBe(true)
    })

    it('reports insufficient balance for the next part', () => {
      const result = getOrderParams(1, funding(99n, 100n), EOA_TWAP_ORDER, undefined, PART_SELL_AMOUNT)

      expect(result.hasEnoughBalance).toBe(false)
      expect(result.hasEnoughAllowance).toBe(true)
    })

    it('reports insufficient allowance for the next part', () => {
      const result = getOrderParams(1, funding(100n, 99n), EOA_TWAP_ORDER, undefined, PART_SELL_AMOUNT)

      expect(result.hasEnoughBalance).toBe(true)
      expect(result.hasEnoughAllowance).toBe(false)
    })

    it('does not report a warning when JIT funding data is missing', () => {
      const result = getOrderParams(1, funding(), EOA_TWAP_ORDER, undefined, PART_SELL_AMOUNT)

      expect(result.hasEnoughBalance).toBeUndefined()
      expect(result.hasEnoughAllowance).toBeUndefined()
    })

    it('requires the full next part even when the parent is partially fillable', () => {
      const result = getOrderParams(1, funding(1n, 1n), EOA_TWAP_ORDER, undefined, PART_SELL_AMOUNT)

      expect(result.hasEnoughBalance).toBe(false)
      expect(result.hasEnoughAllowance).toBe(false)
    })
  })
})
