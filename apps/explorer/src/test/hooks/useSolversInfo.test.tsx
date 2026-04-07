import { renderHook, waitFor } from '@testing-library/react'

import { fetchSolversInfo, SolversInfo } from 'utils/fetchSolversInfo'

import { useSolversInfo } from '../../hooks/useSolversInfo'

jest.mock('utils/fetchSolversInfo', () => ({
  fetchSolversInfo: jest.fn(),
}))

const mockedFetchSolversInfo = jest.mocked(fetchSolversInfo)

const SOLVERS_MAINNET: SolversInfo = [
  {
    solverId: 'alpha',
    displayName: 'Alpha Solver',
    networks: [{ chainId: 1, chainName: 'Ethereum', environments: ['prod'] }],
    deployments: [],
  },
]

const SOLVERS_BASE: SolversInfo = [
  {
    solverId: 'beta',
    displayName: 'Beta Solver',
    networks: [{ chainId: 8453, chainName: 'Base', environments: ['barn'] }],
    deployments: [],
  },
]

describe('useSolversInfo', () => {
  beforeEach(() => {
    mockedFetchSolversInfo.mockReset()
  })

  it('loads solvers info successfully', async () => {
    mockedFetchSolversInfo.mockResolvedValueOnce(SOLVERS_MAINNET)

    const { result } = renderHook(() => useSolversInfo())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.solversInfo).toEqual([])
    expect(result.current.error).toBeNull()

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedFetchSolversInfo).toHaveBeenCalledWith(undefined)
    expect(result.current.solversInfo).toEqual(SOLVERS_MAINNET)
    expect(result.current.error).toBeNull()
  })

  it('returns error and empty data when fetch fails', async () => {
    mockedFetchSolversInfo.mockRejectedValueOnce(new Error('Boom'))

    const { result } = renderHook(() => useSolversInfo())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solversInfo).toEqual([])
    expect(result.current.error).toBe('Boom')
  })

  it('refetches when network changes', async () => {
    mockedFetchSolversInfo.mockResolvedValueOnce(SOLVERS_MAINNET).mockResolvedValueOnce(SOLVERS_BASE)

    const { result, rerender } = renderHook(({ network }) => useSolversInfo(network), {
      initialProps: { network: 1 as number | undefined },
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.solversInfo).toEqual(SOLVERS_MAINNET)

    rerender({ network: 8453 })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedFetchSolversInfo).toHaveBeenNthCalledWith(1, 1)
    expect(mockedFetchSolversInfo).toHaveBeenNthCalledWith(2, 8453)
    expect(result.current.solversInfo).toEqual(SOLVERS_BASE)
  })
})
