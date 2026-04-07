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

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useConnectionType: jest.fn(),
  useSwitchNetwork: () => mockSwitchNetwork,
}))

jest.mock('@cowprotocol/snackbars', () => ({
  useAddSnackbar: () => mockAddSnackbar,
  useRemoveSnackbar: () => mockRemoveSnackbar,
}))

// isMobile is a module-level constant; mock the whole module and override per test
jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  get isMobile() {
    return mockedIsMobile
  },
  get isCoinbaseWalletBrowser() {
    return mockedIsCoinbaseWalletBrowser
  },
}))

let mockedIsMobile = false
let mockedIsCoinbaseWalletBrowser = false

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
    mockedIsCoinbaseWalletBrowser = false
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.INJECTED)
  })

  afterEach(() => {
    jest.useRealTimers()
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
  })

  // Test #2: Desktop Coinbase (isMobile=false)
  it('calls switchNetwork directly for desktop Coinbase wallet', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = false
    mockSwitchNetwork.mockResolvedValue(undefined)

    const { result } = renderHook(() => useSwitchNetworkWithGuidance())

    await act(async () => {
      await result.current(SupportedChainId.GNOSIS_CHAIN)
    })

    expect(mockSwitchNetwork).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN)
    expect(mockAddSnackbar).not.toHaveBeenCalled()
  })

  // Test #3: Mobile Coinbase inside Coinbase browser
  it('does not show guidance snackbar in the Coinbase wallet browser', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = true
    mockedIsCoinbaseWalletBrowser = true
    jest.useFakeTimers()

    const { promise, resolve } = createResolvablePromise()
    mockSwitchNetwork.mockReturnValue(promise)

    const { result } = renderHook(() => useSwitchNetworkWithGuidance())

    await act(async () => {
      const switchPromise = result.current(SupportedChainId.GNOSIS_CHAIN)
      jest.advanceTimersByTime(500)
      expect(mockAddSnackbar).not.toHaveBeenCalled()
      resolve()
      await switchPromise
    })

    expect(mockSwitchNetwork).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN)
    expect(mockRemoveSnackbar).not.toHaveBeenCalled()
  })

  // Test #4: Mobile Coinbase + switch succeeds quickly
  it('does not show guidance snackbar for quick mobile Coinbase switches', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = true
    mockSwitchNetwork.mockResolvedValue(undefined)

    jest.useFakeTimers()

    const { result } = renderHook(() => useSwitchNetworkWithGuidance())

    await act(async () => {
      await result.current(SupportedChainId.GNOSIS_CHAIN)
      jest.advanceTimersByTime(500)
    })

    expect(mockAddSnackbar).not.toHaveBeenCalled()
    expect(mockRemoveSnackbar).toHaveBeenCalledWith('coinbase-mobile-network-switch')
  })

  // Test #5: Mobile Coinbase + switch stays pending
  it('shows guidance snackbar once the mobile Coinbase switch stays pending', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = true

    const { promise, resolve } = createResolvablePromise()
    mockSwitchNetwork.mockReturnValue(promise)

    jest.useFakeTimers()

    const { result } = renderHook(() => useSwitchNetworkWithGuidance())

    await act(async () => {
      const switchPromise = result.current(SupportedChainId.GNOSIS_CHAIN)
      jest.advanceTimersByTime(500)
      expect(mockAddSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'coinbase-mobile-network-switch',
          icon: 'alert',
        }),
      )
      resolve()
      await switchPromise
    })

    expect(mockRemoveSnackbar).toHaveBeenCalledWith('coinbase-mobile-network-switch')
  })

  // Test #6: Mobile Coinbase + switch times out
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
        jest.advanceTimersByTime(500)
        expect(mockAddSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'coinbase-mobile-network-switch',
            icon: 'alert',
          }),
        )
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
  })

  // Test #7: Mobile Coinbase + user rejects quickly
  it('does not show guidance snackbar for immediate rejections on mobile Coinbase', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = true
    const rejectionError = new Error('User rejected')
    mockSwitchNetwork.mockRejectedValue(rejectionError)

    jest.useFakeTimers()

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
    expect(mockAddSnackbar).not.toHaveBeenCalled()
    expect(mockRemoveSnackbar).toHaveBeenCalledWith('coinbase-mobile-network-switch')
  })

  // Test #8: Mobile Coinbase + concurrent from same instance
  it('throws SwitchInProgressError for concurrent call from same instance', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = true

    const { promise, resolve } = createResolvablePromise()
    mockSwitchNetwork.mockReturnValue(promise)

    const { result } = renderHook(() => useSwitchNetworkWithGuidance())

    // Single act block: start first switch, attempt second, then resolve first
    let firstDone = false
    let secondError: Error | undefined

    await act(async () => {
      const firstCall = result.current(SupportedChainId.GNOSIS_CHAIN).then(() => {
        firstDone = true
      })

      // Second call throws synchronously before awaiting — guard is already set
      try {
        await result.current(SupportedChainId.ARBITRUM_ONE)
      } catch (e) {
        secondError = e as Error
      }

      expect(secondError).toBeInstanceOf(SwitchInProgressError)
      // First call's snackbar should NOT have been removed yet
      expect(mockRemoveSnackbar).not.toHaveBeenCalled()

      // Now resolve the first call
      resolve()
      await firstCall
    })

    expect(firstDone).toBe(true)
    expect(mockRemoveSnackbar).toHaveBeenCalledWith('coinbase-mobile-network-switch')
  })

  // Test #9: Mobile Coinbase + concurrent from different instances
  it('shares in-flight guard across different hook instances', async () => {
    ;(useConnectionType as jest.Mock).mockReturnValue(ConnectionType.COINBASE_WALLET)
    mockedIsMobile = true

    const { promise, resolve } = createResolvablePromise()
    mockSwitchNetwork.mockReturnValue(promise)

    // Render two separate hook instances
    const { result: instanceA } = renderHook(() => useSwitchNetworkWithGuidance())
    const { result: instanceB } = renderHook(() => useSwitchNetworkWithGuidance())

    // Single act block: start via A, attempt via B (rejected), resolve A
    let secondError: Error | undefined

    await act(async () => {
      const firstCall = instanceA.current(SupportedChainId.GNOSIS_CHAIN)

      // Instance B should throw SwitchInProgressError
      try {
        await instanceB.current(SupportedChainId.ARBITRUM_ONE)
      } catch (e) {
        secondError = e as Error
      }

      expect(secondError).toBeInstanceOf(SwitchInProgressError)

      // Resolve first call, guard should clear
      resolve()
      await firstCall
    })

    // Now instance B should work (guard cleared)
    const { promise: secondPromise, resolve: resolveSecond } = createResolvablePromise()
    mockSwitchNetwork.mockReturnValue(secondPromise)

    await act(async () => {
      const thirdCall = instanceB.current(SupportedChainId.ARBITRUM_ONE)
      resolveSecond()
      await thirdCall
    })

    expect(mockSwitchNetwork).toHaveBeenCalledTimes(2)
  })
})
