import { SolverCompetitionResponse, SupportedChainId, Trade } from '@cowprotocol/cow-sdk'

import { renderHook, waitFor } from '@testing-library/react'

import { getSolverCompetition, getTrades } from 'api/cowProtocol/api'

import {
  SOLVER_COMPETITION_POLL_INTERVAL_MS,
  SOLVER_COMPETITION_POLL_TIMEOUT_MS,
  fetchWaitAndSaveSolverCompetition,
  getLatestSettlementTxHash,
  pollWaitAndSaveSolverCompetition,
  useWaitAndSaveSolverCompetition,
  type UseWaitAndSaveSolverCompetitionParams,
} from './useWaitAndSaveSolverCompetition'

jest.mock('api/cowProtocol/api', () => ({
  getSolverCompetition: jest.fn(),
  getTrades: jest.fn(),
}))

const getTradesMock = getTrades as jest.MockedFunction<typeof getTrades>
const getSolverCompetitionMock = getSolverCompetition as jest.MockedFunction<typeof getSolverCompetition>

const CHAIN_ID = SupportedChainId.MAINNET
const ORDER_UID = '0xorder'
const COMPETITION = { auctionId: 7 } as SolverCompetitionResponse

function pollOptions(
  overrides: Partial<Parameters<typeof pollWaitAndSaveSolverCompetition>[1]> = {},
): Parameters<typeof pollWaitAndSaveSolverCompetition>[1] {
  return {
    isCancelled: () => false,
    now: () => 0,
    pollIntervalMs: SOLVER_COMPETITION_POLL_INTERVAL_MS,
    sleep: async () => undefined,
    timeoutMs: SOLVER_COMPETITION_POLL_TIMEOUT_MS,
    ...overrides,
  }
}

function trade(overrides: Partial<Pick<Trade, 'blockNumber' | 'logIndex' | 'txHash'>>): Trade {
  return {
    blockNumber: 1,
    logIndex: 0,
    txHash: '0xhash',
    ...overrides,
  } as Trade
}

describe('getLatestSettlementTxHash', () => {
  it('uses the trade with the highest block, then the highest log index', () => {
    const txHash = getLatestSettlementTxHash([
      trade({ blockNumber: 3, logIndex: 1, txHash: '0xsame-block-early' }),
      trade({ blockNumber: 2, logIndex: 9, txHash: '0xolder' }),
      trade({ blockNumber: 4, logIndex: 0, txHash: null }),
      trade({ blockNumber: 3, logIndex: 4, txHash: '0xlatest' }),
    ])

    expect(txHash).toBe('0xlatest')
  })

  it('returns undefined when no trade has a settlement hash', () => {
    expect(getLatestSettlementTxHash([trade({ txHash: null })])).toBeUndefined()
    expect(getLatestSettlementTxHash([])).toBeUndefined()
  })
})

describe('fetchWaitAndSaveSolverCompetition', () => {
  beforeEach(() => {
    getTradesMock.mockReset()
    getSolverCompetitionMock.mockReset()
  })

  it('loads the competition for the latest settlement hash', async () => {
    getTradesMock.mockResolvedValue([
      trade({ blockNumber: 1, txHash: '0xold' }),
      trade({ blockNumber: 5, txHash: '0xsettle' }),
    ])
    getSolverCompetitionMock.mockResolvedValue(COMPETITION)

    await expect(fetchWaitAndSaveSolverCompetition(CHAIN_ID, ORDER_UID)).resolves.toBe(COMPETITION)
    expect(getTradesMock).toHaveBeenCalledWith({ orderUid: ORDER_UID }, { chainId: CHAIN_ID })
    expect(getSolverCompetitionMock).toHaveBeenCalledWith(CHAIN_ID, '0xsettle')
  })

  it('does not request a competition until a settlement hash exists', async () => {
    getTradesMock.mockResolvedValue([trade({ txHash: null })])

    await expect(fetchWaitAndSaveSolverCompetition(CHAIN_ID, ORDER_UID)).resolves.toBeUndefined()
    expect(getSolverCompetitionMock).not.toHaveBeenCalled()
  })

  it('returns undefined when the trades request fails', async () => {
    getTradesMock.mockRejectedValue(new Error('network'))

    await expect(fetchWaitAndSaveSolverCompetition(CHAIN_ID, ORDER_UID)).resolves.toBeUndefined()
    expect(getSolverCompetitionMock).not.toHaveBeenCalled()
  })
})

describe('pollWaitAndSaveSolverCompetition', () => {
  it('returns the first competition without waiting', async () => {
    const sleep = jest.fn()
    const fetchOnce = jest.fn().mockResolvedValue(COMPETITION)

    await expect(pollWaitAndSaveSolverCompetition(fetchOnce, pollOptions({ sleep }))).resolves.toEqual({
      competition: COMPETITION,
      status: 'ready',
    })
    expect(fetchOnce).toHaveBeenCalledTimes(1)
    expect(sleep).not.toHaveBeenCalled()
  })

  it('retries a miss or a thrown attempt on the poll interval', async () => {
    let now = 0
    const fetchOnce = jest
      .fn()
      .mockRejectedValueOnce(new Error('not indexed'))
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(COMPETITION)

    const result = await pollWaitAndSaveSolverCompetition(
      fetchOnce,
      pollOptions({
        now: () => now,
        sleep: async (durationMs) => {
          now += durationMs
        },
      }),
    )

    expect(result).toEqual({ competition: COMPETITION, status: 'ready' })
    expect(fetchOnce).toHaveBeenCalledTimes(3)
    expect(now).toBe(SOLVER_COMPETITION_POLL_INTERVAL_MS * 2)
  })

  it('stops at the timeout without another attempt', async () => {
    let now = 0
    const fetchOnce = jest.fn().mockResolvedValue(undefined)

    const result = await pollWaitAndSaveSolverCompetition(
      fetchOnce,
      pollOptions({
        now: () => now,
        sleep: async (durationMs) => {
          now += durationMs
        },
      }),
    )

    expect(result).toEqual({ status: 'timedOut' })
    expect(fetchOnce).toHaveBeenCalledTimes(SOLVER_COMPETITION_POLL_TIMEOUT_MS / SOLVER_COMPETITION_POLL_INTERVAL_MS)
    expect(now).toBe(SOLVER_COMPETITION_POLL_TIMEOUT_MS)
  })

  it('stops between attempts when cancelled', async () => {
    let cancelled = false
    const fetchOnce = jest.fn().mockResolvedValue(undefined)

    const result = await pollWaitAndSaveSolverCompetition(
      fetchOnce,
      pollOptions({
        isCancelled: () => cancelled,
        sleep: async () => {
          cancelled = true
        },
      }),
    )

    expect(result).toEqual({ status: 'cancelled' })
    expect(fetchOnce).toHaveBeenCalledTimes(1)
  })

  it('gives up when an attempt is still pending at the deadline', async () => {
    jest.useFakeTimers()
    try {
      const fetchOnce = jest.fn().mockReturnValue(new Promise(() => undefined))
      const result = pollWaitAndSaveSolverCompetition(
        fetchOnce,
        pollOptions({
          now: Date.now,
          timeoutMs: 1_000,
        }),
      )

      await jest.advanceTimersByTimeAsync(1_000)

      await expect(result).resolves.toEqual({ status: 'timedOut' })
      expect(fetchOnce).toHaveBeenCalledTimes(1)
    } finally {
      jest.useRealTimers()
    }
  })
})

describe('useWaitAndSaveSolverCompetition', () => {
  beforeEach(() => {
    getTradesMock.mockReset()
    getSolverCompetitionMock.mockReset()
    getTradesMock.mockResolvedValue([trade({ txHash: '0xsettle' })])
    getSolverCompetitionMock.mockResolvedValue(COMPETITION)
  })

  it('does not fetch unless the lookup is enabled for an order', () => {
    const disabled = renderHook(() =>
      useWaitAndSaveSolverCompetition({ chainId: CHAIN_ID, enabled: false, orderUid: ORDER_UID }),
    )
    const missingOrder = renderHook(() =>
      useWaitAndSaveSolverCompetition({ chainId: CHAIN_ID, enabled: true, orderUid: undefined }),
    )

    expect(disabled.result.current).toEqual({ competition: undefined, pending: false })
    expect(missingOrder.result.current).toEqual({ competition: undefined, pending: false })
    expect(getTradesMock).not.toHaveBeenCalled()
  })

  it('stays pending until the competition arrives, then clears it when the order changes', async () => {
    const { result, rerender } = renderHook(
      (props: UseWaitAndSaveSolverCompetitionParams) => useWaitAndSaveSolverCompetition(props),
      { initialProps: { chainId: CHAIN_ID, enabled: true, orderUid: ORDER_UID } },
    )

    expect(result.current).toEqual({ competition: undefined, pending: true })

    await waitFor(() => expect(result.current).toEqual({ competition: COMPETITION, pending: false }))

    rerender({ chainId: CHAIN_ID, enabled: true, orderUid: '0xother' })

    expect(result.current).toEqual({ competition: undefined, pending: true })
    await waitFor(() => expect(getTradesMock).toHaveBeenCalledWith({ orderUid: '0xother' }, { chainId: CHAIN_ID }))
  })

  it('is pending again when the same order is re-enabled until a new payload arrives', async () => {
    const { result, rerender } = renderHook(
      (props: UseWaitAndSaveSolverCompetitionParams) => useWaitAndSaveSolverCompetition(props),
      { initialProps: { chainId: CHAIN_ID, enabled: true, orderUid: ORDER_UID } },
    )

    await waitFor(() => expect(result.current.pending).toBe(false))

    rerender({ chainId: CHAIN_ID, enabled: false, orderUid: ORDER_UID })
    expect(result.current).toEqual({ competition: undefined, pending: false })

    let resolveCompetition: (competition: SolverCompetitionResponse) => void = () => undefined
    getSolverCompetitionMock.mockReturnValue(
      new Promise((resolve) => {
        resolveCompetition = resolve
      }),
    )

    rerender({ chainId: CHAIN_ID, enabled: true, orderUid: ORDER_UID })
    expect(result.current).toEqual({ competition: undefined, pending: true })

    resolveCompetition({ auctionId: 9 } as SolverCompetitionResponse)
    await waitFor(() => expect(result.current).toEqual({ competition: { auctionId: 9 }, pending: false }))
  })
})
