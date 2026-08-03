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
import { fetchSolversInfo, SolverInfo } from 'utils/fetchSolversInfo'

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

// Valid 42-char all-hex addresses, so `areAddressesEqual` and `shortenAddress` behave as in prod.
// All-digit so the EIP-55 checksum is an identity and the shortened form is predictable.
const BLANC_ADDRESS = '0x1111111111111111111111111111111111111111'
const EXT_QUASIMODO_ADDRESS = '0x4444444444444444444444444444444444444444'
const UNKNOWN_ADDRESS = '0x3333333333333333333333333333333333333333'

const MOCK_SOLVERS: SolverInfo[] = [
  {
    solverId: 'projectblanc',
    displayName: 'Project Blanc',
    image: 'https://example.com/blanc.png',
    networks: [],
    deployments: [{ chainId: 1, chainName: 'mainnet', address: BLANC_ADDRESS, active: true }],
  },
  {
    solverId: 'copperSolver',
    displayName: 'Copper Solver',
    networks: [],
    deployments: [],
  },
]

const CROSS_NETWORK_SOLVER: SolverInfo = {
  solverId: 'ExtQuasimodo',
  displayName: 'ExtQuasimodo',
  image: 'https://example.com/extquasimodo.svg',
  networks: [],
  deployments: [{ chainId: 1, chainName: 'mainnet', address: EXT_QUASIMODO_ADDRESS, active: true }],
}

function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    uid: '0x1',
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

function mockCompetitionStatus(solverAddress: string): OrderCompetitionStatus {
  return {
    type: 'traded' as OrderCompetitionStatus['type'],
    value: [{ solver: solverAddress, executedAmounts: { sell: '1', buy: '1' } }],
  }
}

function mockSolverCompetitionResponse(solverAddress: string, orderId = '0x1'): SolverCompetitionResponse {
  return {
    auctionId: 1,
    solutions: [
      {
        isWinner: true,
        solverAddress,
        ranking: 1,
        orders: [{ id: orderId }],
      } as unknown as NonNullable<SolverCompetitionResponse['solutions']>[0],
    ],
  } as SolverCompetitionResponse
}

describe('useOrderSolver', () => {
  beforeEach(() => {
    jest.useRealTimers()
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
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus(BLANC_ADDRESS))
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
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce(mockSolverCompetitionResponse(BLANC_ADDRESS))

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

  it('falls back to a shortened address when the txHash competition winner is not in CMS', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(undefined)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce(mockSolverCompetitionResponse(UNKNOWN_ADDRESS))

    const order = createMockOrder({ txHash: '0xunknown' })
    const { result } = renderHook(() => useOrderSolver(order))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetSolverCompetitionByTxHash).toHaveBeenCalledWith({ networkId: 1, txHash: '0xunknown' })
    expect(result.current.solver).toEqual({
      solverId: UNKNOWN_ADDRESS,
      displayName: '0x3333...3333',
      image: undefined,
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
      value: [{ solver: BLANC_ADDRESS, executedAmounts: { sell: '0', buy: '0' } }],
    })
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const order = createMockOrder({ txHash: undefined })
    const { result } = renderHook(() => useOrderSolver(order))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetSolverCompetitionByTxHash).not.toHaveBeenCalled()
    expect(result.current.solver).toBeUndefined()
  })

  it('falls back to txHash competition when executed amounts are malformed', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce({
      type: 'traded' as OrderCompetitionStatus['type'],
      value: [{ solver: UNKNOWN_ADDRESS, executedAmounts: { sell: 'da1', buy: '0' } }],
    })
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce(mockSolverCompetitionResponse(BLANC_ADDRESS))

    const order = createMockOrder({ txHash: '0xmalformed' })
    const { result } = renderHook(() => useOrderSolver(order))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetSolverCompetitionByTxHash).toHaveBeenCalledWith({ networkId: 1, txHash: '0xmalformed' })
    expect(result.current.solver).toEqual({
      solverId: 'projectblanc',
      displayName: 'Project Blanc',
      image: 'https://example.com/blanc.png',
    })
  })

  it('ignores malformed executed amounts without txHash fallback', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce({
      type: 'traded' as OrderCompetitionStatus['type'],
      value: [{ solver: UNKNOWN_ADDRESS, executedAmounts: { sell: '1e2', buy: '0' } }],
    })
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const order = createMockOrder({ txHash: undefined })
    const { result } = renderHook(() => useOrderSolver(order))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetSolverCompetitionByTxHash).not.toHaveBeenCalled()
    expect(result.current.solver).toBeUndefined()
  })

  it('matches solver metadata from the global list even when the current network has no CMS deployment', async () => {
    mockedUseNetworkId.mockReturnValue(42161)
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus(EXT_QUASIMODO_ADDRESS))
    mockedFetchSolversInfo.mockResolvedValueOnce([CROSS_NETWORK_SOLVER])

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: 'ExtQuasimodo',
      displayName: 'ExtQuasimodo',
      image: 'https://example.com/extquasimodo.svg',
    })
    expect(mockedFetchSolversInfo).toHaveBeenCalledWith()
  })

  it('falls back to a shortened address when no CMS match is found', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus(UNKNOWN_ADDRESS))
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: UNKNOWN_ADDRESS,
      displayName: '0x3333...3333',
      image: undefined,
    })
  })

  it('handles fetchSolversInfo failure gracefully', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus(BLANC_ADDRESS))
    mockedFetchSolversInfo.mockRejectedValueOnce(new Error('CMS down'))

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: BLANC_ADDRESS,
      displayName: '0x1111...1111',
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

  it('settles loading when competition endpoints are unavailable after delay', async () => {
    jest.useFakeTimers()
    try {
      mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)
      mockedGetOrderCompetitionStatus.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('competition timeout')), 50)
          }),
      )
      mockedGetSolverCompetitionByTxHash.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('solver competition timeout')), 50)
          }),
      )

      const { result } = renderHook(() => useOrderSolver(createMockOrder()))

      expect(result.current.isLoading).toBe(true)

      await jest.advanceTimersByTimeAsync(51)

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.solver).toBeUndefined()
    } finally {
      jest.useRealTimers()
    }
  })

  it('clears stale solver when navigating to an order with no solver data', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus(BLANC_ADDRESS))
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
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce(mockSolverCompetitionResponse(BLANC_ADDRESS))

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
        { solver: UNKNOWN_ADDRESS, executedAmounts: { sell: '1', buy: '1' } },
        { solver: BLANC_ADDRESS, executedAmounts: { sell: '2', buy: '2' } },
      ],
    }
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(status)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver?.displayName).toBe('Project Blanc')
  })
})
