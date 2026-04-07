import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ConnectionType } from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'

import {
  _resetInFlightState,
  SwitchInProgressError,
  useSwitchNetworkWithGuidance,
} from './useSwitchNetworkWithGuidance'

// --- Mocks ---

const mockSwitchNetwork = jest.fn()
const mockAddSnackbar = jest.fn()
const mockRemoveSnackbar = jest.fn()
const mockSendEvent = jest.fn()
let mockChainId = SupportedChainId.MAINNET

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useConnectionType: jest.fn(),
  useSwitchNetwork: () => mockSwitchNetwork,
  useWalletInfo: () => ({
    chainId: mockChainId,
  }),
}))

jest.mock('@cowprotocol/snackbars', () => ({
  useAddSnackbar: () => mockAddSnackbar,
  useRemoveSnackbar: () => mockRemoveSnackbar,
}))

jest.mock('@cowprotocol/analytics', () => ({
  ...jest.requireActual('@cowprotocol/analytics'),
  __resetGtmInstance: jest.fn(),
  useCowAnalytics: () => ({
    sendEvent: mockSendEvent,
  }),
}))

// isMobile is a module-level constant; mock the whole module and override per test
jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  get isMobile() {
    return mockedIsMobile
  },
}))

let mockedIsMobile = false

const { useConnectionType } = jest.requireMock('@cowprotocol/wallet')

// --- Helpers ---

function createResolvablePromise(): { promise: Promise<void>; resolve: () => void; reject: (err: Error) => void } {
  let resolve!: () => void
  let reject!: (err: Error) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

// --- Tests ---

describe('useSwitchNetworkWithGuidance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    _resetInFlightState()
    mockedIsMobile = false
    mockChainId = SupportedChainId.MAINNET
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.INJECTED)
  })

  // Test #1: Non-Coinbase wallet
  it('calls switchNetwork directly for non-Coinbase wallet', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.INJECTED)
    mockSwitchNetwork.mockResolvedValue(undefined)

    const { result } = renderHook(() => useSwitchNetworkWithGuidance())

    await act(async () => {
      await result.current(SupportedChainId.GNOSIS_CHAIN)
    })

    expect(mockSwitchNetwork).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN)
    expect(mockAddSnackbar).not.toHaveBeenCalled()
    expect(mockRemoveSnackbar).not.toHaveBeenCalled()
    expect(mockSendEvent).not.toHaveBeenCalled()
  })

  // Test #2: Desktop Coinbase (isMobile=false)
  it('emits success only after the target chain is observed for desktop Coinbase', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = false
    mockSwitchNetwork.mockResolvedValue(undefined)

    const { result, rerender } = renderHook(() => useSwitchNetworkWithGuidance())
    const switchPromise = result.current(SupportedChainId.GNOSIS_CHAIN)

    expect(mockSwitchNetwork).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN)
    expect(mockAddSnackbar).not.toHaveBeenCalled()
    expect(mockSendEvent).toHaveBeenCalledTimes(1)
    expect(mockSendEvent).toHaveBeenCalledWith(
      'coinbase_connection_flow',
      expect.objectContaining({
        stage: 'switchStart',
        source: 'networkSelector',
        result: 'started',
      }),
    )

    mockChainId = SupportedChainId.GNOSIS_CHAIN
    rerender()

    await act(async () => {
      await switchPromise
    })

    expect(mockSendEvent).toHaveBeenNthCalledWith(
      2,
      'coinbase_connection_flow',
      expect.objectContaining({
        stage: 'switchSuccess',
        source: 'networkSelector',
        result: 'success',
      }),
    )
  })

  // Test #3: Mobile Coinbase + switch succeeds
  it('shows guidance snackbar and removes it on success for mobile Coinbase', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = true
    mockSwitchNetwork.mockResolvedValue(undefined)

    const { result, rerender } = renderHook(() => useSwitchNetworkWithGuidance())
    const switchPromise = result.current(SupportedChainId.GNOSIS_CHAIN)

    expect(mockAddSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'coinbase-mobile-network-switch',
        icon: 'alert',
      }),
    )
    expect(mockSwitchNetwork).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN)

    mockChainId = SupportedChainId.GNOSIS_CHAIN
    rerender()

    await act(async () => {
      await switchPromise
    })

    expect(mockRemoveSnackbar).toHaveBeenCalledWith('coinbase-mobile-network-switch')
    expect(mockSendEvent).toHaveBeenCalledWith(
      'coinbase_connection_flow',
      expect.objectContaining({
        stage: 'switchSuccess',
        source: 'networkSelector',
      }),
    )
  })

  // Test #4: Mobile Coinbase + switch times out
  it('removes snackbar and rethrows on timeout for mobile Coinbase', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = true
    // Never resolves → timeout will fire
    mockSwitchNetwork.mockReturnValue(new Promise(() => {}))

    jest.useFakeTimers()

    const { result } = renderHook(() => useSwitchNetworkWithGuidance())

    let error: Error | undefined
    const promise = act(async () => {
      try {
        const switchPromise = result.current(SupportedChainId.GNOSIS_CHAIN)
        jest.advanceTimersByTime(60_000)
        await switchPromise
      } catch (e) {
        error = e as Error
      }
    })

    await promise

    expect(error).toBeDefined()
    expect(error!.message).toContain('Timeout')
    expect(mockRemoveSnackbar).toHaveBeenCalledWith('coinbase-mobile-network-switch')
    expect(mockSendEvent).toHaveBeenCalledWith(
      'coinbase_connection_flow',
      expect.objectContaining({
        stage: 'switchError',
        result: 'error',
        source: 'networkSelector',
      }),
    )

    jest.useRealTimers()
  })

  // Test #5: Desktop Coinbase + request resolves without changing the chain
  it('times out instead of emitting success when the chain never changes on desktop Coinbase', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = false
    mockSwitchNetwork.mockResolvedValue(undefined)

    jest.useFakeTimers()

    const { result } = renderHook(() => useSwitchNetworkWithGuidance())

    let error: Error | undefined

    await act(async () => {
      try {
        const switchPromise = result.current(SupportedChainId.GNOSIS_CHAIN)
        jest.advanceTimersByTime(60_000)
        await switchPromise
      } catch (e) {
        error = e as Error
      }
    })

    expect(error).toBeDefined()
    expect(error!.message).toContain('Timeout')
    expect(mockSendEvent).not.toHaveBeenCalledWith(
      'coinbase_connection_flow',
      expect.objectContaining({
        stage: 'switchSuccess',
      }),
    )
    expect(mockSendEvent).toHaveBeenCalledWith(
      'coinbase_connection_flow',
      expect.objectContaining({
        stage: 'switchError',
        result: 'error',
        source: 'networkSelector',
      }),
    )

    jest.useRealTimers()
  })

  // Test #6: Mobile Coinbase + user rejects
  it('removes snackbar and rethrows on rejection for mobile Coinbase', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = true
    const rejectionError = new Error('User rejected')
    mockSwitchNetwork.mockRejectedValue(rejectionError)

    const { result } = renderHook(() => useSwitchNetworkWithGuidance())

    let error: Error | undefined
    await act(async () => {
      try {
        await result.current(SupportedChainId.GNOSIS_CHAIN)
      } catch (e) {
        error = e as Error
      }
    })

    expect(error).toBe(rejectionError)
    expect(mockAddSnackbar).toHaveBeenCalled()
    expect(mockRemoveSnackbar).toHaveBeenCalledWith('coinbase-mobile-network-switch')
    expect(mockSendEvent).toHaveBeenCalledWith(
      'coinbase_connection_flow',
      expect.objectContaining({
        stage: 'switchError',
        source: 'networkSelector',
      }),
    )
  })

  // Test #7: Desktop Coinbase + concurrent from same instance
  it('throws SwitchInProgressError for concurrent desktop Coinbase calls', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = false

    const { promise, resolve } = createResolvablePromise()
    mockSwitchNetwork.mockReturnValue(promise)

    const { result, rerender } = renderHook(() => useSwitchNetworkWithGuidance())

    // Single act block: start first switch, attempt second, then resolve first
    let firstDone = false
    let secondError: Error | undefined

    const firstCall = result.current(SupportedChainId.GNOSIS_CHAIN).then(() => {
      firstDone = true
    })

    await act(async () => {
      try {
        await result.current(SupportedChainId.ARBITRUM_ONE)
      } catch (e) {
        secondError = e as Error
      }
    })

    expect(secondError).toBeInstanceOf(SwitchInProgressError)

    mockChainId = SupportedChainId.GNOSIS_CHAIN
    rerender()
    resolve()

    await act(async () => {
      await firstCall
    })

    expect(firstDone).toBe(true)
    expect(mockAddSnackbar).not.toHaveBeenCalled()
    expect(mockSendEvent).toHaveBeenCalledWith(
      'coinbase_connection_flow',
      expect.objectContaining({
        stage: 'switchBlockedInFlight',
        result: 'blocked',
        source: 'networkSelector',
        isMobile: false,
      }),
    )
  })

  // Test #8: Mobile Coinbase + concurrent from different instances
  it('shares in-flight guard across different hook instances', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = true

    const { promise, resolve } = createResolvablePromise()
    mockSwitchNetwork.mockReturnValue(promise)

    // Render two separate hook instances
    const { result: resultA, rerender: rerenderA } = renderHook(() => useSwitchNetworkWithGuidance())
    const { result: resultB, rerender: rerenderB } = renderHook(() => useSwitchNetworkWithGuidance())

    // Single act block: start via A, attempt via B (rejected), resolve A
    let secondError: Error | undefined
    const firstCall = resultA.current(SupportedChainId.GNOSIS_CHAIN)

    await act(async () => {
      // Instance B should throw SwitchInProgressError
      try {
        await resultB.current(SupportedChainId.ARBITRUM_ONE)
      } catch (e) {
        secondError = e as Error
      }
    })

    expect(secondError).toBeInstanceOf(SwitchInProgressError)

    mockChainId = SupportedChainId.GNOSIS_CHAIN
    rerenderA()
    rerenderB()
    resolve()

    await act(async () => {
      await firstCall
    })

    // Now instance B should work (guard cleared)
    const { promise: secondPromise, resolve: resolveSecond } = createResolvablePromise()
    mockSwitchNetwork.mockReturnValue(secondPromise)
    const thirdCall = resultB.current(SupportedChainId.ARBITRUM_ONE)

    mockChainId = SupportedChainId.ARBITRUM_ONE
    rerenderA()
    rerenderB()
    resolveSecond()

    await act(async () => {
      await thirdCall
    })

    expect(mockSwitchNetwork).toHaveBeenCalledTimes(2)
  })
})
