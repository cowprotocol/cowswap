import { ConnectionType, useConnectionType, useIsSmartContractWallet } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useIsPermitEnabled } from './useIsPermitEnabled'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useConnectionType: jest.fn(),
  useIsSmartContractWallet: jest.fn(),
}))

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: jest.fn(),
}))

const mockUseIsSmartContractWallet = useIsSmartContractWallet as jest.MockedFunction<typeof useIsSmartContractWallet>
const mockUseInjectedWidgetParams = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>
const mockUseConnectionType = useConnectionType as jest.MockedFunction<typeof useConnectionType>

describe('useIsPermitEnabled', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseInjectedWidgetParams.mockReturnValue({})
    mockUseConnectionType.mockReturnValue(ConnectionType.INJECTED)
  })

  it('returns true for EOA wallets when the widget param is unset', () => {
    mockUseIsSmartContractWallet.mockReturnValue(false)

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(true)
  })

  it('returns false for smart-contract wallets even when the widget param is unset', () => {
    mockUseIsSmartContractWallet.mockReturnValue(true)

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(false)
  })

  it('returns false when disableEIP2612Permits is true, even for EOA wallets', () => {
    mockUseIsSmartContractWallet.mockReturnValue(false)
    mockUseInjectedWidgetParams.mockReturnValue({ disableEIP2612Permits: true })

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(false)
  })

  it('returns true when disableEIP2612Permits is false and wallet is EOA', () => {
    mockUseIsSmartContractWallet.mockReturnValue(false)
    mockUseInjectedWidgetParams.mockReturnValue({ disableEIP2612Permits: false })

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(true)
  })

  it('returns false for Base Account even when it is detected as an EOA', () => {
    mockUseIsSmartContractWallet.mockReturnValue(false)
    mockUseConnectionType.mockReturnValue(ConnectionType.BASE_ACCOUNT)

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(false)
  })
})
