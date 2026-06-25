import { act, renderHook } from '@testing-library/react'
import { useCapabilities } from 'wagmi'

import { useWalletCapabilities } from './useWalletCapabilities'

jest.mock('wagmi', () => ({
  useCapabilities: jest.fn(),
}))

jest.mock('../../wagmi/hooks/useWalletMetadata', () => ({
  useIsSafeViaWc: jest.fn(() => false),
}))

jest.mock('../hooks', () => ({
  useWalletInfo: jest.fn(() => ({ account: '0x0000000000000000000000000000000000000001', chainId: 1 })),
}))

describe('useWalletCapabilities', () => {
  const mockUseCapabilities = useCapabilities as jest.MockedFunction<typeof useCapabilities>

  beforeEach(() => {
    jest.useFakeTimers()
    mockUseCapabilities.mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof useCapabilities>)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('stops reporting loading when capabilities do not settle before timeout', () => {
    const { result } = renderHook(() => useWalletCapabilities())

    expect(result.current.isLoading).toBe(true)

    act(() => {
      jest.advanceTimersByTime(4_999)
    })

    expect(result.current.isLoading).toBe(true)

    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(result.current.isLoading).toBe(false)
  })
})
