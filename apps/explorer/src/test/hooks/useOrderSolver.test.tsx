import { renderHook, waitFor } from '@testing-library/react'
import BigNumber from 'bignumber.js'
import { useNetworkId } from 'state/network'

import {
  getOrderCompetitionStatus,
  getSolverCompetitionByTxHash,
  Order,
  OrderCompetitionStatus,
  SolverCompetitionResponse,
} from 'api/operator'
import { SolverInfo, fetchSolversInfo } from 'utils/fetchSolversInfo'

import { useOrderSolver } from '../../hooks/useOrderSolver'

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(),
}))

jest.mock('api/operator', () => ({
  getOrderCompetitionStatus: jest.fn(),
  getSolverCompetitionByTxHash: jest.fn(),
}))

jest.mock('utils/fetchSolversInfo', () => ({
  fetchSolversInfo: jest.fn(),
}))

const mockedUseNetworkId = jest.mocked(useNetworkId)
const mockedGetOrderCompetitionStatus = jest.mocked(getOrderCompetitionStatus)
const mockedGetSolverCompetitionByTxHash = jest.mocked(getSolverCompetitionByTxHash)
const mockedFetchSolversInfo = jest.mocked(fetchSolversInfo)

const ZERO = new BigNumber(0)
const ONE = new BigNumber(1)

const MOCK_SOLVERS: SolverInfo[] = [
  {
    solverId: 'projectblanc',
    displayName: 'Project Blanc',
    image: 'https://example.com/blanc.png',
    networks: [],
    deployments: [],
  },
  {
    solverId: 'copperSolver',
    displayName: 'Copper Solver',
    networks: [],
    deployments: [],
  },
]

function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    uid: 'order-abc-123',
    owner: '0x1234',
    receiver: '0x5678',
    kind: 'sell',
    partiallyFillable: false,
    signature: '0x',
    class: 'limit',
    appData: '0x',
    fullAppData: null,
    executedFeeToken: null,
    creationDate: new Date(),
    expirationDate: new Date(),
    buyTokenAddress: '0xtoken1',
    sellTokenAddress: '0xtoken2',
    buyAmount: ONE,
    sellAmount: ONE,
    executedBuyAmount: ONE,
    executedSellAmount: ONE,
    feeAmount: ZERO,
    executedFeeAmount: ZERO,
    executedFee: null,
    totalFee: ZERO,
    cancelled: false,
    status: 'filled',
    partiallyFilled: false,
    fullyFilled: true,
    filledAmount: ONE,
    filledPercentage: new BigNumber(100),
    surplusAmount: ZERO,
    surplusPercentage: ZERO,
    txHash: '0xtx123',
    ...overrides,
  } as Order
}

function mockCompetitionStatus(solverName: string): OrderCompetitionStatus {
  return {
    type: 'traded' as OrderCompetitionStatus['type'],
    value: [{ solver: solverName, executedAmounts: { sell: '1', buy: '1' } }],
  }
}

function mockSolverCompetitionResponse(solverName: string): SolverCompetitionResponse {
  return {
    auctionId: 1,
    solutions: [
      {
        solver: solverName,
        isWinner: true,
        solverAddress: '0xsolver',
        ranking: 1,
        orders: [],
      } as unknown as NonNullable<SolverCompetitionResponse['solutions']>[0],
    ],
  } as SolverCompetitionResponse
}

describe('useOrderSolver', () => {
  beforeEach(() => {
    mockedUseNetworkId.mockReset()
    mockedGetOrderCompetitionStatus.mockReset()
    mockedGetSolverCompetitionByTxHash.mockReset()
    mockedFetchSolversInfo.mockReset()

    mockedUseNetworkId.mockReturnValue(1)
  })

  it('returns undefined solver and no loading for null order', () => {
    const { result } = renderHook(() => useOrderSolver(null))

    expect(result.current.solver).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('returns undefined solver and no loading when networkId is falsy', () => {
    mockedUseNetworkId.mockReturnValue(null as unknown as number)

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    expect(result.current.solver).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('returns no solver for unfilled orders and skips solver lookups', () => {
    const { result } = renderHook(() =>
      useOrderSolver(
        createMockOrder({
          txHash: undefined,
          executedBuyAmount: ZERO,
          executedSellAmount: ZERO,
          filledAmount: ZERO,
          filledPercentage: ZERO,
          fullyFilled: false,
          status: 'cancelled' as Order['status'],
        }),
      ),
    )

    expect(result.current.solver).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(mockedGetOrderCompetitionStatus).not.toHaveBeenCalled()
    expect(mockedGetSolverCompetitionByTxHash).not.toHaveBeenCalled()
    expect(mockedFetchSolversInfo).not.toHaveBeenCalled()
  })

  it('is loading while resolving solver', () => {
    mockedGetOrderCompetitionStatus.mockReturnValue(new Promise(() => {}))
    mockedFetchSolversInfo.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.solver).toBeUndefined()
  })

  it('resolves solver from order competition status', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus('projectblanc'))
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: 'projectblanc',
      displayName: 'Project Blanc',
      image: 'https://example.com/blanc.png',
    })
    expect(mockedGetSolverCompetitionByTxHash).not.toHaveBeenCalled()
  })

  it('falls back to txHash competition when order status has no winner', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(undefined)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce(mockSolverCompetitionResponse('projectblanc'))

    const order = createMockOrder({ txHash: '0xfallback' })
    const { result } = renderHook(() => useOrderSolver(order))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetSolverCompetitionByTxHash).toHaveBeenCalledWith({ networkId: 1, txHash: '0xfallback' })
    expect(result.current.solver).toEqual({
      solverId: 'projectblanc',
      displayName: 'Project Blanc',
      image: 'https://example.com/blanc.png',
    })
  })

  it('does not attempt txHash fallback when no txHash is available', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(undefined)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const order = createMockOrder({ txHash: undefined, executedBuyAmount: ZERO, executedSellAmount: ZERO })
    const { result } = renderHook(() => useOrderSolver(order))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetSolverCompetitionByTxHash).not.toHaveBeenCalled()
    expect(result.current.solver).toBeUndefined()
  })

  it('ignores competition entries that have zero executed amounts', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce({
      type: 'traded' as OrderCompetitionStatus['type'],
      value: [{ solver: 'projectblanc', executedAmounts: { sell: '0', buy: '0' } }],
    })
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const order = createMockOrder({ txHash: undefined })
    const { result } = renderHook(() => useOrderSolver(order))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetSolverCompetitionByTxHash).not.toHaveBeenCalled()
    expect(result.current.solver).toBeUndefined()
  })

  it('normalizes solver name with -Solve suffix for matching', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus('CopperSolver-Solve'))
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: 'copperSolver',
      displayName: 'Copper Solver',
      image: undefined,
    })
  })

  it('returns raw solver name when no CMS match is found', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus('unknownSolver'))
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: 'unknownSolver',
      displayName: 'unknownSolver',
      image: undefined,
    })
  })

  it('handles fetchSolversInfo failure gracefully', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus('projectblanc'))
    mockedFetchSolversInfo.mockRejectedValueOnce(new Error('CMS down'))

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: 'projectblanc',
      displayName: 'projectblanc',
      image: undefined,
    })
  })

  it('handles both APIs failing gracefully', async () => {
    mockedGetOrderCompetitionStatus.mockRejectedValueOnce(new Error('fail'))
    mockedFetchSolversInfo.mockRejectedValueOnce(new Error('fail'))

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toBeUndefined()
  })

  it('clears stale solver when navigating to an order with no solver data', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus('projectblanc'))
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const orderA = createMockOrder({ uid: 'order-a', txHash: '0xtxA' })
    const { result, rerender } = renderHook(({ order }) => useOrderSolver(order), {
      initialProps: { order: orderA as Order | null },
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.solver?.displayName).toBe('Project Blanc')

    // Navigate to order B which has no competition data
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(undefined)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce(undefined)

    const orderB = createMockOrder({ uid: 'order-b', txHash: '0xtxB' })
    rerender({ order: orderB })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.solver).toBeUndefined()
  })

  it('resolves via txHash fallback when txHash arrives after initial load', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(undefined)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const filledNoTxHash = createMockOrder({ txHash: undefined })
    const { result, rerender } = renderHook(({ order }) => useOrderSolver(order), {
      initialProps: { order: filledNoTxHash as Order | null },
    })

    // First resolve: no txHash, no competition data — finishes with no solver
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.solver).toBeUndefined()

    // Now provide the txHash via rerender — effect re-runs because currentKey changed
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(undefined)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce(mockSolverCompetitionResponse('projectblanc'))

    const withTxHash = createMockOrder({ uid: filledNoTxHash.uid, txHash: '0xnewtx' })
    rerender({ order: withTxHash })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: 'projectblanc',
      displayName: 'Project Blanc',
      image: 'https://example.com/blanc.png',
    })
  })

  it('finishes loading for multi-trade filled orders without txHash', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(undefined)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    // Multi-trade order: filled but getOrderWithTxHash won't inject txHash
    const multiTradeOrder = createMockOrder({ txHash: undefined })
    const { result } = renderHook(() => useOrderSolver(multiTradeOrder))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.solver).toBeUndefined()
  })

  it('picks the last executed solver as winner', async () => {
    const status: OrderCompetitionStatus = {
      type: 'traded' as OrderCompetitionStatus['type'],
      value: [
        { solver: 'loser', executedAmounts: { sell: '1', buy: '1' } },
        { solver: 'projectblanc', executedAmounts: { sell: '2', buy: '2' } },
      ],
    }
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(status)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver?.displayName).toBe('Project Blanc')
  })
})
