/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { useIsPermitEnabled } from './useIsPermitEnabled'

jest.mock('@cowprotocol/wallet', () => ({
  useIsSmartContractWallet: jest.fn(),
}))

jest.mock('modules/injectedWidget', () => ({
  useInjectedWidgetParams: jest.fn(),
}))

const mockUseIsSmartContractWallet = useIsSmartContractWallet as jest.MockedFunction<typeof useIsSmartContractWallet>
const mockUseInjectedWidgetParams = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>

describe('useIsPermitEnabled', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseInjectedWidgetParams.mockReturnValue({})
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

  it('returns false when disableEIP2612Permits is true and wallet is a smart contract', () => {
    mockUseIsSmartContractWallet.mockReturnValue(true)
    mockUseInjectedWidgetParams.mockReturnValue({ disableEIP2612Permits: true })

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(false)
  })
})
