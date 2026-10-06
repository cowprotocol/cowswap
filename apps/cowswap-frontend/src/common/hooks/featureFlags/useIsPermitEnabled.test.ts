import { getDefaultStore, type PrimitiveAtom } from 'jotai'

import { isSmartContractWalletAtom } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useIsPermitEnabled } from './useIsPermitEnabled'

jest.mock('@cowprotocol/wallet', () => ({
  isSmartContractWalletAtom: jest.requireActual('jotai').atom(false),
}))

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: jest.fn(),
}))

const writableIsSmartContractWalletAtom = isSmartContractWalletAtom as PrimitiveAtom<boolean | null>
const mockUseInjectedWidgetParams = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>

describe('useIsPermitEnabled', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseInjectedWidgetParams.mockReturnValue({})
  })

  it('returns true for EOA wallets when the widget param is unset', () => {
    getDefaultStore().set(writableIsSmartContractWalletAtom, false)

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(true)
  })

  it('returns false for smart-contract wallets even when the widget param is unset', () => {
    getDefaultStore().set(writableIsSmartContractWalletAtom, true)

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(false)
  })

  it('returns false when disableEIP2612Permits is true, even for EOA wallets', () => {
    getDefaultStore().set(writableIsSmartContractWalletAtom, false)
    mockUseInjectedWidgetParams.mockReturnValue({ disableEIP2612Permits: true })

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(false)
  })

  it('returns true when disableEIP2612Permits is false and wallet is EOA', () => {
    getDefaultStore().set(writableIsSmartContractWalletAtom, false)
    mockUseInjectedWidgetParams.mockReturnValue({ disableEIP2612Permits: false })

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(true)
  })
})
