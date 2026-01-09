import type { OrderFillability } from 'modules/ordersTable'

import { computeUnfillableOrderIds, getNewlyFillableOrderIds } from './utils'

type TestOrder = {
  id: string
  isUnfillable?: boolean
}

const FILLABILITY_OK: OrderFillability = {
  hasEnoughBalance: true,
  hasEnoughAllowance: true,
  hasPermit: false,
}

const FILLABILITY_LACKING_BALANCE: OrderFillability = {
  hasEnoughBalance: false,
  hasEnoughAllowance: true,
  hasPermit: false,
}

const FILLABILITY_LACKING_ALLOWANCE: OrderFillability = {
  hasEnoughBalance: true,
  hasEnoughAllowance: false,
  hasPermit: false,
}

describe('computeUnfillableOrderIds', () => {
  it('includes orders flagged as unfillable by price', () => {
    const orders: TestOrder[] = [{ id: '1', isUnfillable: true }]

    const result = computeUnfillableOrderIds(orders, {})

    expect(result).toEqual(['1'])
  })

  it('includes orders lacking balance or allowance', () => {
    const orders: TestOrder[] = [{ id: '2' }]

    const result = computeUnfillableOrderIds(orders, {
      '2': FILLABILITY_LACKING_BALANCE,
    })

    expect(result).toEqual(['2'])
  })

  it('deduplicates orders flagged by both sources', () => {
    const orders: TestOrder[] = [{ id: '3', isUnfillable: true }]

    const result = computeUnfillableOrderIds(orders, {
      '3': FILLABILITY_LACKING_ALLOWANCE,
    })

    expect(result).toEqual(['3'])
  })

  it('ignores orders that are fillable and not flagged', () => {
    const orders: TestOrder[] = [{ id: '4', isUnfillable: false }, { id: '5' }]

    const result = computeUnfillableOrderIds(orders, {
      '4': FILLABILITY_OK,
      '5': FILLABILITY_OK,
    })

    expect(result).toEqual([])
  })
})

describe('getNewlyFillableOrderIds', () => {
  it('returns orders that were previously unfillable but not in the current set', () => {
    const previous = new Set(['1', '2', '3'])
    const current = new Set(['2', '3', '4'])

    const result = getNewlyFillableOrderIds(previous, current)

    expect(result).toEqual(['1'])
  })

  it('returns an empty list when nothing recovered', () => {
    const previous = new Set(['1'])
    const current = new Set(['1'])

    const result = getNewlyFillableOrderIds(previous, current)

    expect(result).toEqual([])
  })

  it('handles an empty previous set', () => {
    const previous = new Set<string>()
    const current = new Set(['1'])

    const result = getNewlyFillableOrderIds(previous, current)

    expect(result).toEqual([])
  })
})
