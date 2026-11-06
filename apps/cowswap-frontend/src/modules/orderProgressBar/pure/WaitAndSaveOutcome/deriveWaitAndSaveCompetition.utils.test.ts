import { getAddressKey, type SolverSettlement } from '@cowprotocol/cow-sdk'

import {
  buildSolverRankingRows,
  deriveWaitAndSaveCompetition,
  getBatchCompanionCount,
  getPositiveAloneGain,
  hasAloneBid,
} from './deriveWaitAndSaveCompetition.utils'

const ORDER_UID = '0xabc'
const COMPANION_A = '0xother-a'
const COMPANION_B = '0xother-b'

const SOLVER_A = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
const SOLVER_A_CHECKSUM = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const SOLVER_B = '0x2222222222222222222222222222222222222222'
const SOLVER_C = '0x3333333333333333333333333333333333333333'

type CompetitionOrder = NonNullable<SolverSettlement['orders']>[number]

function competitionOrder(id: string, buyAmount?: string, sellAmount = '10'): CompetitionOrder {
  return { buyAmount, id, sellAmount }
}

function solution(partial: Partial<SolverSettlement> = {}): SolverSettlement {
  return {
    filteredOut: false,
    isWinner: false,
    orders: [competitionOrder(ORDER_UID, '100')],
    ranking: 2,
    solverAddress: SOLVER_A,
    ...partial,
  }
}

describe('getPositiveAloneGain', () => {
  it('returns the buy delta when the winning fill beats the best alone bid', () => {
    const gain = getPositiveAloneGain(
      [
        solution({
          isWinner: true,
          orders: [competitionOrder(ORDER_UID, '10188'), competitionOrder(COMPANION_A, '1')],
          ranking: 1,
          solverAddress: SOLVER_A,
        }),
        solution({ orders: [competitionOrder(ORDER_UID, '10000')], ranking: 3, solverAddress: SOLVER_B }),
        solution({ orders: [competitionOrder(ORDER_UID, '9000')], ranking: 4, solverAddress: SOLVER_C }),
      ],
      ORDER_UID,
    )

    expect(gain).toEqual({
      bestAloneBuyAmount: 10000n,
      gainAmount: 188n,
      gainPercent: 1.88,
      winningBuyAmount: 10188n,
    })
  })

  it('keeps a one-atom gain', () => {
    const gain = getPositiveAloneGain(
      [
        solution({
          isWinner: true,
          orders: [competitionOrder(ORDER_UID, '100'), competitionOrder(COMPANION_A, '1')],
          solverAddress: SOLVER_A,
        }),
        solution({ orders: [competitionOrder(ORDER_UID, '99')], solverAddress: SOLVER_B }),
      ],
      ORDER_UID,
    )

    expect(gain?.gainAmount).toBe(1n)
    expect(gain?.gainPercent).toBeGreaterThan(0)
  })

  it('reports a tiny percent without collapsing it to zero', () => {
    const alone = '1000000000000000000'
    const winning = '1000000000000000001'
    const gain = getPositiveAloneGain(
      [
        solution({
          isWinner: true,
          orders: [competitionOrder(ORDER_UID, winning, '1'), competitionOrder(COMPANION_A, '1')],
          solverAddress: SOLVER_A,
        }),
        solution({ orders: [competitionOrder(ORDER_UID, alone, '1')], solverAddress: SOLVER_B }),
      ],
      ORDER_UID,
    )

    expect(gain?.gainAmount).toBe(1n)
    expect(gain?.gainPercent).toBeGreaterThan(0)
    expect(gain?.gainPercent).toBeLessThan(0.01)
  })

  it('omits the percent when the alone bid buys nothing', () => {
    const gain = getPositiveAloneGain(
      [
        solution({
          isWinner: true,
          orders: [competitionOrder(ORDER_UID, '5'), competitionOrder(COMPANION_A, '1')],
          solverAddress: SOLVER_A,
        }),
        solution({ orders: [competitionOrder(ORDER_UID, '0')], solverAddress: SOLVER_B }),
      ],
      ORDER_UID,
    )

    expect(gain).toEqual({
      bestAloneBuyAmount: 0n,
      gainAmount: 5n,
      gainPercent: undefined,
      winningBuyAmount: 5n,
    })
  })

  it('ignores a batched solution when choosing the alone baseline', () => {
    const gain = getPositiveAloneGain(
      [
        solution({
          isWinner: true,
          orders: [competitionOrder(ORDER_UID, '200'), competitionOrder(COMPANION_A, '1')],
          solverAddress: SOLVER_A,
        }),
        solution({
          orders: [competitionOrder(ORDER_UID, '190'), competitionOrder(COMPANION_B, '1')],
          solverAddress: SOLVER_B,
        }),
        solution({ orders: [competitionOrder(ORDER_UID, '100')], solverAddress: SOLVER_C }),
      ],
      ORDER_UID,
    )

    expect(gain?.bestAloneBuyAmount).toBe(100n)
    expect(gain?.gainAmount).toBe(100n)
  })

  it('ignores alone bids whose sell amount differs from the winning fill', () => {
    const solutions = [
      solution({
        isWinner: true,
        orders: [competitionOrder(ORDER_UID, '200', '10'), competitionOrder(COMPANION_A, '1')],
        solverAddress: SOLVER_A,
      }),
      solution({ orders: [competitionOrder(ORDER_UID, '50', '5')], solverAddress: SOLVER_B }),
      solution({ orders: [competitionOrder(ORDER_UID, '100', '10')], solverAddress: SOLVER_C }),
    ]

    const gain = getPositiveAloneGain(solutions, ORDER_UID)

    expect(gain?.bestAloneBuyAmount).toBe(100n)
    expect(gain?.gainAmount).toBe(100n)
    expect(hasAloneBid(solutions, ORDER_UID)).toBe(true)
  })

  it('returns nothing when every alone bid uses a different sell amount', () => {
    const solutions = [
      solution({
        isWinner: true,
        orders: [competitionOrder(ORDER_UID, '200', '10'), competitionOrder(COMPANION_A, '1')],
        solverAddress: SOLVER_A,
      }),
      solution({ orders: [competitionOrder(ORDER_UID, '50', '5')], solverAddress: SOLVER_B }),
    ]

    expect(getPositiveAloneGain(solutions, ORDER_UID)).toBeUndefined()
    expect(hasAloneBid(solutions, ORDER_UID)).toBe(false)
  })

  it('does not treat a higher non-winning buy as the execution', () => {
    const gain = getPositiveAloneGain(
      [
        solution({
          isWinner: false,
          orders: [competitionOrder(ORDER_UID, '999'), competitionOrder(COMPANION_B, '1')],
          ranking: 1,
          solverAddress: SOLVER_B,
        }),
        solution({
          isWinner: true,
          orders: [competitionOrder(ORDER_UID, '150'), competitionOrder(COMPANION_A, '1')],
          ranking: 2,
          solverAddress: SOLVER_A,
        }),
        solution({ orders: [competitionOrder(ORDER_UID, '100')], ranking: 3, solverAddress: SOLVER_C }),
      ],
      ORDER_UID,
    )

    expect(gain?.winningBuyAmount).toBe(150n)
    expect(gain?.gainAmount).toBe(50n)
  })

  it('returns nothing when the winning buy does not beat the best alone bid', () => {
    const equal = [
      solution({ isWinner: true, orders: [competitionOrder(ORDER_UID, '100')], solverAddress: SOLVER_A }),
      solution({ orders: [competitionOrder(ORDER_UID, '100')], solverAddress: SOLVER_B }),
    ]
    const worse = [
      solution({ isWinner: true, orders: [competitionOrder(ORDER_UID, '80')], solverAddress: SOLVER_A }),
      solution({ orders: [competitionOrder(ORDER_UID, '100')], solverAddress: SOLVER_B }),
    ]

    expect(getPositiveAloneGain(equal, ORDER_UID)).toBeUndefined()
    expect(getPositiveAloneGain(worse, ORDER_UID)).toBeUndefined()
    expect(hasAloneBid(equal, ORDER_UID)).toBe(true)
    expect(hasAloneBid(worse, ORDER_UID)).toBe(true)
  })

  it('returns nothing when the winner is the only alone bid', () => {
    const solutions = [solution({ isWinner: true, orders: [competitionOrder(ORDER_UID, '100')] })]

    expect(getPositiveAloneGain(solutions, ORDER_UID)).toBeUndefined()
    expect(hasAloneBid(solutions, ORDER_UID)).toBe(true)
  })

  it('returns nothing when there is no solo bid or no winning solution', () => {
    const batchedOnly = [
      solution({
        isWinner: true,
        orders: [competitionOrder(ORDER_UID, '100'), competitionOrder(COMPANION_A, '1')],
      }),
    ]
    const noWinner = [solution({ orders: [competitionOrder(ORDER_UID, '100')], solverAddress: SOLVER_B })]

    expect(getPositiveAloneGain(batchedOnly, ORDER_UID)).toBeUndefined()
    expect(hasAloneBid(batchedOnly, ORDER_UID)).toBe(false)
    expect(getPositiveAloneGain(noWinner, ORDER_UID)).toBeUndefined()
    expect(hasAloneBid(noWinner, ORDER_UID)).toBe(false)
    expect(getPositiveAloneGain(undefined, ORDER_UID)).toBeUndefined()
    expect(hasAloneBid(undefined, ORDER_UID)).toBe(false)
  })

  it('ignores filtered-out solo bids and solutions for a different order', () => {
    const solutions = [
      solution({
        isWinner: true,
        orders: [competitionOrder(ORDER_UID, '200'), competitionOrder(COMPANION_A, '1')],
        solverAddress: SOLVER_A,
      }),
      solution({ filteredOut: true, orders: [competitionOrder(ORDER_UID, '50')], solverAddress: SOLVER_B }),
      solution({ isWinner: true, orders: [competitionOrder(COMPANION_A, '999')], solverAddress: SOLVER_C }),
    ]

    expect(getPositiveAloneGain(solutions, ORDER_UID)).toBeUndefined()
    expect(hasAloneBid(solutions, ORDER_UID)).toBe(false)
  })

  it('matches the order uid case-insensitively', () => {
    const gain = getPositiveAloneGain(
      [
        solution({
          isWinner: true,
          orders: [competitionOrder('0xAbC', '110'), competitionOrder(COMPANION_A, '1')],
          solverAddress: SOLVER_A,
        }),
        solution({ orders: [competitionOrder('0xABC', '100')], solverAddress: SOLVER_B }),
      ],
      '0xabc',
    )

    expect(gain?.gainAmount).toBe(10n)
  })
})

describe('getBatchCompanionCount', () => {
  it('counts other order uids on the winning solution once', () => {
    const count = getBatchCompanionCount(
      [
        solution({
          isWinner: true,
          orders: [
            competitionOrder(ORDER_UID, '100'),
            competitionOrder(COMPANION_A, '1'),
            competitionOrder(COMPANION_A, '1'),
            competitionOrder('0xOther-B', '1'),
            { sellAmount: '1' },
          ],
        }),
        solution({
          orders: [competitionOrder(ORDER_UID, '90'), competitionOrder('0xnot-counted', '1')],
          solverAddress: SOLVER_B,
        }),
      ],
      ORDER_UID,
    )

    expect(count).toBe(2)
  })

  it('is zero when the winning solution is only this order', () => {
    expect(
      getBatchCompanionCount([solution({ isWinner: true, orders: [competitionOrder(ORDER_UID, '100')] })], ORDER_UID),
    ).toBe(0)
  })

  it('is missing when no winning solution contains this order', () => {
    expect(getBatchCompanionCount([solution({ isWinner: false })], ORDER_UID)).toBeUndefined()
    expect(getBatchCompanionCount(undefined, ORDER_UID)).toBeUndefined()
    expect(
      getBatchCompanionCount(
        [solution({ filteredOut: true, isWinner: true, orders: [competitionOrder(ORDER_UID, '1')] })],
        ORDER_UID,
      ),
    ).toBeUndefined()
  })

  it('uses the winning solution with the higher buy when two winners contain the order', () => {
    const count = getBatchCompanionCount(
      [
        solution({
          isWinner: true,
          orders: [competitionOrder(ORDER_UID, '100'), competitionOrder(COMPANION_A, '1')],
          ranking: 1,
          solverAddress: SOLVER_A,
        }),
        solution({
          isWinner: true,
          orders: [
            competitionOrder(ORDER_UID, '180'),
            competitionOrder(COMPANION_A, '1'),
            competitionOrder(COMPANION_B, '1'),
          ],
          ranking: 2,
          solverAddress: SOLVER_B,
        }),
      ],
      ORDER_UID,
    )

    expect(count).toBe(2)
  })
})

describe('buildSolverRankingRows', () => {
  it('keeps one row per solver address with the winner first', () => {
    const rows = buildSolverRankingRows(
      [
        solution({
          orders: [competitionOrder(ORDER_UID, '90', '7')],
          ranking: 4,
          solverAddress: SOLVER_A,
        }),
        solution({
          orders: [competitionOrder(ORDER_UID, '150', '8')],
          ranking: 1,
          solverAddress: SOLVER_B,
        }),
        solution({
          isWinner: true,
          orders: [competitionOrder(ORDER_UID, '200', '9'), competitionOrder(COMPANION_A, '1', '2')],
          ranking: 3,
          solverAddress: SOLVER_A_CHECKSUM,
        }),
        solution({
          orders: [competitionOrder(ORDER_UID, '120', '6')],
          ranking: 2,
          solverAddress: SOLVER_C,
        }),
        solution({
          orders: [competitionOrder(COMPANION_A, '999', '1')],
          ranking: 1,
          solverAddress: '0x4444444444444444444444444444444444444444',
        }),
        solution({
          filteredOut: true,
          orders: [competitionOrder(ORDER_UID, '170', '1')],
          ranking: 1,
          solverAddress: '0x5555555555555555555555555555555555555555',
        }),
        solution({
          orders: [competitionOrder(ORDER_UID, '160')],
          ranking: 1,
          solverAddress: undefined,
        }),
      ],
      ORDER_UID,
    )

    expect(rows).toEqual([
      { executedAmounts: { buy: '200', sell: '9' }, solver: getAddressKey(SOLVER_A) },
      { executedAmounts: { buy: '150', sell: '8' }, solver: getAddressKey(SOLVER_B) },
      { executedAmounts: { buy: '120', sell: '6' }, solver: getAddressKey(SOLVER_C) },
    ])
  })

  it('orders equal ranks by the higher buy and leaves unranked solvers last', () => {
    const rows = buildSolverRankingRows(
      [
        solution({ orders: [competitionOrder(ORDER_UID, '110', '1')], ranking: undefined, solverAddress: SOLVER_C }),
        solution({ orders: [competitionOrder(ORDER_UID, '140', '1')], ranking: 2, solverAddress: SOLVER_B }),
        solution({ orders: [competitionOrder(ORDER_UID, '130', '1')], ranking: 2, solverAddress: SOLVER_A }),
      ],
      ORDER_UID,
    )

    expect(rows.map((row) => row.solver)).toEqual([
      getAddressKey(SOLVER_B),
      getAddressKey(SOLVER_A),
      getAddressKey(SOLVER_C),
    ])
  })

  it('keeps the winning solution when that solver also bid alone', () => {
    const rows = buildSolverRankingRows(
      [
        solution({ orders: [competitionOrder(ORDER_UID, '90', '4')], ranking: 2, solverAddress: SOLVER_A }),
        solution({
          isWinner: true,
          orders: [competitionOrder(ORDER_UID, '200', '5'), competitionOrder(COMPANION_A, '1')],
          ranking: 1,
          solverAddress: SOLVER_A,
        }),
      ],
      ORDER_UID,
    )

    expect(rows).toEqual([{ executedAmounts: { buy: '200', sell: '5' }, solver: getAddressKey(SOLVER_A) }])
  })

  it('skips a solution whose fill amounts are not decimal atoms', () => {
    const rows = buildSolverRankingRows(
      [
        solution({ orders: [competitionOrder(ORDER_UID, '0x10', '1')], solverAddress: SOLVER_A }),
        solution({ orders: [{ buyAmount: '10', id: ORDER_UID }], solverAddress: SOLVER_B }),
      ],
      ORDER_UID,
    )

    expect(rows).toEqual([])
  })

  it('returns an empty list when nothing includes this order', () => {
    expect(buildSolverRankingRows(undefined, ORDER_UID)).toEqual([])
    expect(buildSolverRankingRows([], ORDER_UID)).toEqual([])
  })
})

describe('deriveWaitAndSaveCompetition', () => {
  it('reports a CoW gain together with the companion count and winner-first rows', () => {
    const derived = deriveWaitAndSaveCompetition(
      [
        solution({ orders: [competitionOrder(ORDER_UID, '100', '4')], ranking: 2, solverAddress: SOLVER_B }),
        solution({
          isWinner: true,
          orders: [competitionOrder(ORDER_UID, '130', '4'), competitionOrder(COMPANION_A, '1')],
          ranking: 1,
          solverAddress: SOLVER_A,
        }),
      ],
      ORDER_UID,
    )

    expect(derived.positiveGain?.gainAmount).toBe(30n)
    expect(derived.hasAloneBid).toBe(true)
    expect(derived.companionCount).toBe(1)
    expect(derived.solvers.map((row) => row.solver)).toEqual([getAddressKey(SOLVER_A), getAddressKey(SOLVER_B)])
  })

  it('reports a shared batch with no gain when the alone bid is not better', () => {
    const derived = deriveWaitAndSaveCompetition(
      [
        solution({ orders: [competitionOrder(ORDER_UID, '140', '4')], ranking: 2, solverAddress: SOLVER_B }),
        solution({
          isWinner: true,
          orders: [
            competitionOrder(ORDER_UID, '130', '4'),
            competitionOrder(COMPANION_A, '1'),
            competitionOrder(COMPANION_B, '1'),
          ],
          ranking: 1,
          solverAddress: SOLVER_A,
        }),
      ],
      ORDER_UID,
    )

    expect(derived.positiveGain).toBeUndefined()
    expect(derived.hasAloneBid).toBe(true)
    expect(derived.companionCount).toBe(2)
  })

  it('reports a joined batch when the winner is only this order', () => {
    const derived = deriveWaitAndSaveCompetition(
      [solution({ isWinner: true, orders: [competitionOrder(ORDER_UID, '130', '4')], solverAddress: SOLVER_A })],
      ORDER_UID,
    )

    expect(derived.positiveGain).toBeUndefined()
    expect(derived.hasAloneBid).toBe(true)
    expect(derived.companionCount).toBe(0)
    expect(derived.solvers).toHaveLength(1)
  })
})
