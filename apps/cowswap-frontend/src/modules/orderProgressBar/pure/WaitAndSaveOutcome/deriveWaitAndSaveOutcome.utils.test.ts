import { OrderClass, SolverCompetitionResponse } from '@cowprotocol/cow-sdk'

import {
  buildWaitAndSaveView,
  deriveWaitAndSaveOutcome,
  listCompanionOrderUids,
} from './deriveWaitAndSaveOutcome.utils'

import type { WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.pure'

const YOU = '0xabc'
const TRADER = '0xdef'
const LIQUIDITY = '0x111'
const UNKNOWN = '0x222'

const outcome: WaitAndSaveOutcomeProps = {
  gainAmount: '1',
  gainFiat: '1',
  gainPercent: 1,
  tradingAloneAmount: '10',
  tradingAloneNumeric: 10,
  gainNumeric: 1,
  tokenSymbol: 'USDC',
}

function competition(solutions: NonNullable<SolverCompetitionResponse['solutions']>): SolverCompetitionResponse {
  return { solutions }
}

function solution(
  orders: Array<{ id: string; buyAmount: string }>,
  isWinner = false,
): NonNullable<SolverCompetitionResponse['solutions']>[number] {
  return { isWinner, orders }
}

describe('deriveWaitAndSaveOutcome', () => {
  it('treats a winning solution with another trader order as a CoW and uses the best one-trader buy', () => {
    const result = deriveWaitAndSaveOutcome({
      orderUid: YOU,
      competition: competition([
        solution([
          { id: YOU, buyAmount: '3390' },
          { id: LIQUIDITY, buyAmount: '1' },
        ]),
        solution(
          [
            { id: YOU, buyAmount: '3684' },
            { id: TRADER, buyAmount: '10' },
          ],
          true,
        ),
        solution([{ id: YOU, buyAmount: '3000' }]),
      ]),
      classByOrderUid: {
        [TRADER]: OrderClass.MARKET,
        [LIQUIDITY]: OrderClass.LIQUIDITY,
      },
    })

    expect(result).toEqual({
      membership: 'cow',
      executedBuy: '3684',
      tradingAloneBuy: '3390',
    })
  })

  it('stays a CoW when the winner has no one-trader solution to compare against', () => {
    const result = deriveWaitAndSaveOutcome({
      orderUid: YOU,
      competition: competition([
        solution(
          [
            { id: YOU, buyAmount: '3684' },
            { id: TRADER, buyAmount: '10' },
          ],
          true,
        ),
      ]),
      classByOrderUid: { [TRADER]: OrderClass.LIMIT },
    })

    expect(result).toEqual({
      membership: 'cow',
      executedBuy: '3684',
      tradingAloneBuy: undefined,
    })
  })

  it('keeps a trading-alone baseline when companion classes are unknown', () => {
    const result = deriveWaitAndSaveOutcome({
      orderUid: YOU.toUpperCase(),
      competition: competition([
        solution([{ id: YOU, buyAmount: '100' }]),
        solution(
          [
            { id: YOU, buyAmount: '180' },
            { id: UNKNOWN, buyAmount: '1' },
          ],
          true,
        ),
      ]),
      classByOrderUid: {},
    })

    expect(result).toEqual({
      membership: 'unconfirmed',
      executedBuy: '180',
      tradingAloneBuy: '100',
    })
  })

  it('is unconfirmed without a baseline when every solution has an unclassified extra order', () => {
    const result = deriveWaitAndSaveOutcome({
      orderUid: YOU,
      competition: competition([
        solution(
          [
            { id: YOU, buyAmount: '180' },
            { id: UNKNOWN, buyAmount: '1' },
          ],
          true,
        ),
      ]),
      classByOrderUid: { [UNKNOWN]: 'unknown' },
    })

    expect(result).toEqual({
      membership: 'unconfirmed',
      executedBuy: '180',
      tradingAloneBuy: undefined,
    })
  })

  it('does not count a market-maker liquidity order as a CoW', () => {
    const result = deriveWaitAndSaveOutcome({
      orderUid: YOU,
      competition: competition([
        solution(
          [
            { id: YOU, buyAmount: '100' },
            { id: LIQUIDITY, buyAmount: '5' },
          ],
          true,
        ),
      ]),
      classByOrderUid: { [LIQUIDITY]: OrderClass.LIQUIDITY },
    })

    expect(result).toEqual({ membership: 'not_cow' })
  })

  it('is unavailable when the order is missing from the winning solution', () => {
    const result = deriveWaitAndSaveOutcome({
      orderUid: YOU,
      competition: competition([solution([{ id: TRADER, buyAmount: '1' }], true)]),
      classByOrderUid: { [TRADER]: OrderClass.MARKET },
    })

    expect(result).toEqual({ membership: 'unavailable' })
  })

  it('is unavailable when competition data never arrived', () => {
    expect(
      deriveWaitAndSaveOutcome({
        orderUid: YOU,
        competition: undefined,
        classByOrderUid: {},
        unavailable: true,
      }),
    ).toEqual({ membership: 'unavailable' })
  })

  it('still reports a CoW when one winner companion is a trader and another class lookup failed', () => {
    const result = deriveWaitAndSaveOutcome({
      orderUid: YOU,
      competition: competition([
        solution(
          [
            { id: YOU, buyAmount: '10' },
            { id: TRADER, buyAmount: '1' },
            { id: UNKNOWN, buyAmount: '1' },
          ],
          true,
        ),
      ]),
      classByOrderUid: { [TRADER]: OrderClass.MARKET },
    })

    expect(result.membership).toBe('cow')
    expect(result.tradingAloneBuy).toBeUndefined()
  })
})

describe('listCompanionOrderUids', () => {
  it('returns each extra order from solutions that include this order once', () => {
    expect(
      listCompanionOrderUids(
        competition([
          solution([
            { id: YOU, buyAmount: '1' },
            { id: LIQUIDITY, buyAmount: '1' },
          ]),
          solution(
            [
              { id: YOU, buyAmount: '1' },
              { id: LIQUIDITY, buyAmount: '1' },
              { id: TRADER, buyAmount: '1' },
            ],
            true,
          ),
          solution([{ id: TRADER, buyAmount: '1' }]),
        ]),
        YOU,
      ),
    ).toEqual([LIQUIDITY, TRADER])
  })
})

describe('buildWaitAndSaveView', () => {
  it('hides matching chrome when Wait & Save is off', () => {
    expect(
      buildWaitAndSaveView({
        enabled: false,
        isLoading: true,
        derivation: { membership: 'cow', executedBuy: '2', tradingAloneBuy: '1' },
        outcome,
      }),
    ).toEqual({ footerVariant: null, outcome: null })
  })

  it('uses the unconfirmed footer while competition data is loading', () => {
    expect(buildWaitAndSaveView({ enabled: true, isLoading: true, derivation: undefined, outcome: null })).toEqual({
      footerVariant: 'unconfirmed',
      outcome: null,
    })
  })

  it('shows the card only when membership is known or unconfirmed and a gain was measured', () => {
    expect(
      buildWaitAndSaveView({
        enabled: true,
        isLoading: false,
        derivation: { membership: 'cow', executedBuy: '2', tradingAloneBuy: '1' },
        outcome,
      }),
    ).toEqual({ footerVariant: 'cow', outcome })

    expect(
      buildWaitAndSaveView({
        enabled: true,
        isLoading: false,
        derivation: { membership: 'cow', executedBuy: '2' },
        outcome: null,
      }),
    ).toEqual({ footerVariant: 'cow', outcome: null })

    expect(
      buildWaitAndSaveView({
        enabled: true,
        isLoading: false,
        derivation: { membership: 'unconfirmed', executedBuy: '2', tradingAloneBuy: '1' },
        outcome,
      }),
    ).toEqual({ footerVariant: 'unconfirmed', outcome })

    expect(
      buildWaitAndSaveView({
        enabled: true,
        isLoading: false,
        derivation: { membership: 'unavailable' },
        outcome: null,
      }),
    ).toEqual({ footerVariant: 'unavailable', outcome: null })

    expect(
      buildWaitAndSaveView({
        enabled: true,
        isLoading: false,
        derivation: { membership: 'not_cow' },
        outcome,
      }),
    ).toEqual({ footerVariant: null, outcome: null })
  })
})
