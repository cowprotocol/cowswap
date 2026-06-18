import { renderHook, waitFor } from '@testing-library/react'
import { useNetworkId } from 'state/network'

import { getSolverCompetitionByTxHash, SolverCompetitionResponse } from 'api/operator'
import { SolverInfo, fetchSolversInfo } from 'utils/fetchSolversInfo'

import { useTradeSolver } from '../../hooks/useTradeSolver'

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(),
}))

jest.mock('api/operator', () => ({
  getSolverCompetitionByTxHash: jest.fn(),
}))

jest.mock('utils/fetchSolversInfo', () => ({
  fetchSolversInfo: jest.fn(),
}))

const mockedUseNetworkId = jest.mocked(useNetworkId)
const mockedGetSolverCompetitionByTxHash = jest.mocked(getSolverCompetitionByTxHash)
const mockedFetchSolversInfo = jest.mocked(fetchSolversInfo)

const BLANC_ADDRESS = '0xBlanc0000000000000000000000000000000001'
const EXT_QUASIMODO_ADDRESS = '0xExt00000000000000000000000000000000000002'

const MOCK_SOLVERS: SolverInfo[] = [
  {
    solverId: 'projectblanc',
    displayName: 'Project Blanc',
    image: 'https://example.com/blanc.png',
    networks: [],
    deployments: [{ chainId: 1, chainName: 'mainnet', address: BLANC_ADDRESS, active: true }],
  },
]

const CROSS_NETWORK_SOLVER: SolverInfo = {
  solverId: 'ExtQuasimodo',
  displayName: 'ExtQuasimodo',
  image: 'https://example.com/extquasimodo.svg',
  networks: [],
  deployments: [{ chainId: 1, chainName: 'mainnet', address: EXT_QUASIMODO_ADDRESS, active: true }],
}

function mockSolverCompetitionResponse(solverAddress: string, orderId: string): SolverCompetitionResponse {
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

describe('useTradeSolver', () => {
  beforeEach(() => {
    mockedUseNetworkId.mockReset()
    mockedGetSolverCompetitionByTxHash.mockReset()
    mockedFetchSolversInfo.mockReset()

    mockedUseNetworkId.mockReturnValue(1)
  })

  it('returns no loading and no solver for null txHash', () => {
    const { result } = renderHook(() => useTradeSolver(null, null))

    expect(result.current.solver).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('resolves solver from txHash competition data by matching the winner solverAddress', async () => {
    const orderId = '0xorder123'
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce(mockSolverCompetitionResponse(BLANC_ADDRESS, orderId))
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useTradeSolver('0xtx123', orderId))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: 'projectblanc',
      displayName: 'Project Blanc',
      image: 'https://example.com/blanc.png',
    })
    expect(mockedFetchSolversInfo).toHaveBeenCalledWith()
  })

  it('returns undefined solver when the winner solverAddress matches no known deployment', async () => {
    const orderId = '0xorderNoMatch'
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce(
      mockSolverCompetitionResponse('0xUnknownAddress00000000000000000000000000', orderId),
    )
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useTradeSolver('0xtxNoMatch', orderId))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toBeUndefined()
  })

  it('matches solver metadata from the global list even when the current network has no CMS deployment', async () => {
    const orderId = '0xorder456'
    mockedUseNetworkId.mockReturnValue(42161)
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce(
      mockSolverCompetitionResponse(EXT_QUASIMODO_ADDRESS, orderId),
    )
    mockedFetchSolversInfo.mockResolvedValueOnce([CROSS_NETWORK_SOLVER])

    const { result } = renderHook(() => useTradeSolver('0xextquasimodo', orderId))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: 'ExtQuasimodo',
      displayName: 'ExtQuasimodo',
      image: 'https://example.com/extquasimodo.svg',
    })
    expect(mockedFetchSolversInfo).toHaveBeenCalledWith()
  })

  it('returns undefined solver when no winner in competition', async () => {
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce({
      auctionId: 1,
      solutions: [],
    } as unknown as SolverCompetitionResponse)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useTradeSolver('0xtx456', '0xorder789'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toBeUndefined()
  })

  it('handles API failure gracefully', async () => {
    mockedGetSolverCompetitionByTxHash.mockRejectedValueOnce(new Error('API down'))
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useTradeSolver('0xtx789', '0xorderabc'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toBeUndefined()
  })

  it('returns undefined solver when winner solution orderId mismatches requested orderId', async () => {
    const requestedOrderId = '0xrequestedOrder123'
    const winnerOrderId = '0xwinnerOrder456'

    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce({
      auctionId: 1,
      solutions: [
        {
          isWinner: true,
          solverAddress: BLANC_ADDRESS,
          ranking: 1,
          orders: [{ id: winnerOrderId }],
        } as unknown as NonNullable<SolverCompetitionResponse['solutions']>[0],
      ],
    } as SolverCompetitionResponse)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useTradeSolver('0xtx789', requestedOrderId))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toBeUndefined()
    expect(mockedFetchSolversInfo).toHaveBeenCalledWith()
  })
})
