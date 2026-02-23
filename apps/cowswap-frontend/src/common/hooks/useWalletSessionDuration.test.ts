import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import type { WalletDetails } from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'

import { useWalletSessionDuration } from './useWalletSessionDuration'

jest.mock('@cowprotocol/analytics', () => ({
  __resetGtmInstance: jest.fn(),
  useCowAnalytics: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletDetails: jest.fn(),
  useWalletInfo: jest.fn(),
}))

type VisibilityStateValue = 'visible' | 'hidden'

function setVisibilityState(state: VisibilityStateValue): void {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: state,
  })
}

function buildWalletDetails(walletName: string): WalletDetails {
  return {
    walletName,
    isSmartContractWallet: false,
    isSupportedWallet: true,
    isSafeApp: false,
    allowsOffchainSigning: true,
  }
}

describe('useWalletSessionDuration', () => {
  const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
  const mockUseWalletDetails = useWalletDetails as jest.MockedFunction<typeof useWalletDetails>
  const mockUseCowAnalytics = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>

  let nowMs = 0
  let sendEventMock: jest.Mock

  beforeEach(() => {
    nowMs = 1_000
    sendEventMock = jest.fn()
    jest.spyOn(Date, 'now').mockImplementation(() => nowMs)

    mockUseWalletInfo.mockReturnValue({
      account: '0x1111111111111111111111111111111111111111',
      chainId: 1,
    })
    mockUseWalletDetails.mockReturnValue(buildWalletDetails('Rainbow'))
    mockUseCowAnalytics.mockReturnValue({
      sendEvent: sendEventMock,
    } as unknown as ReturnType<typeof useCowAnalytics>)

    setVisibilityState('visible')
  })

  afterEach(() => {
    jest.clearAllMocks()
    setVisibilityState('visible')
  })

  it('emits delta checkpoints on hide and one final checkpoint on cleanup', () => {
    const { unmount } = renderHook(() => useWalletSessionDuration())

    // First hide: 6s elapsed (>= 5s threshold)
    nowMs = 7_000
    act(() => {
      setVisibilityState('hidden')
      document.dispatchEvent(new Event('visibilitychange'))
      setVisibilityState('visible')
    })

    // Second hide: 6s elapsed since last checkpoint
    nowMs = 13_000
    act(() => {
      setVisibilityState('hidden')
      document.dispatchEvent(new Event('visibilitychange'))
      setVisibilityState('visible')
    })

    // Cleanup: 6s elapsed since last checkpoint
    nowMs = 19_000
    unmount()

    expect(sendEventMock).toHaveBeenCalledTimes(3)
    expect(sendEventMock).toHaveBeenNthCalledWith(1, {
      category: 'Wallet',
      action: 'wallet_session_duration',
      label: 'Rainbow',
      value: 6,
      chainId: 1,
    })
    expect(sendEventMock).toHaveBeenNthCalledWith(2, {
      category: 'Wallet',
      action: 'wallet_session_duration',
      label: 'Rainbow',
      value: 6,
      chainId: 1,
    })
    expect(sendEventMock).toHaveBeenNthCalledWith(3, {
      category: 'Wallet',
      action: 'wallet_session_duration',
      label: 'Rainbow',
      value: 6,
      chainId: 1,
    })
  })

  it('does not emit when elapsed duration is below five seconds', () => {
    const { unmount } = renderHook(() => useWalletSessionDuration())

    // 4.5s elapsed — below 5s threshold (even though it would round to 5)
    nowMs = 5_500
    act(() => {
      setVisibilityState('hidden')
      document.dispatchEvent(new Event('visibilitychange'))
    })

    unmount()

    expect(sendEventMock).not.toHaveBeenCalled()
  })

  it('uses latest wallet name without restarting timer on wallet-name updates', () => {
    const { rerender } = renderHook(() => useWalletSessionDuration())

    nowMs = 7_000
    mockUseWalletDetails.mockReturnValue(buildWalletDetails('MetaMask'))
    rerender()

    // 8s elapsed (>= 5s threshold)
    nowMs = 9_000
    act(() => {
      setVisibilityState('hidden')
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(sendEventMock).toHaveBeenCalledTimes(1)
    expect(sendEventMock).toHaveBeenCalledWith({
      category: 'Wallet',
      action: 'wallet_session_duration',
      label: 'MetaMask',
      value: 8,
      chainId: 1,
    })
  })

  it('emits last connected wallet name on disconnect cleanup', () => {
    const { rerender } = renderHook(() => useWalletSessionDuration())

    // Advance 6s (>= 5s threshold)
    nowMs = 7_000

    // Disconnect: account and walletName become undefined
    mockUseWalletInfo.mockReturnValue({ account: undefined, chainId: 1 })
    mockUseWalletDetails.mockReturnValue(buildWalletDetails(undefined as unknown as string))
    rerender()

    // The cleanup of the previous effect should emit with 'Rainbow', not 'Unknown'
    expect(sendEventMock).toHaveBeenCalledTimes(1)
    expect(sendEventMock).toHaveBeenCalledWith({
      category: 'Wallet',
      action: 'wallet_session_duration',
      label: 'Rainbow',
      value: 6,
      chainId: 1,
    })
  })
})
