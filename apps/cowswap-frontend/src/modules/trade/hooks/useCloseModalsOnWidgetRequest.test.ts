import { useAtomValue } from 'jotai'

import { renderHook } from '@testing-library/react'

import { useCloseModals } from 'legacy/state/application/hooks'

import { useCloseAccountModal } from 'modules/account'
import { useCloseAllModalsRequest } from 'modules/injectedWidget'

import { useCloseModalsOnWidgetRequest } from './useCloseModalsOnWidgetRequest'
import { useSetOrdersTableDrawerOpen } from './useSetOrdersTableDrawerOpen'
import { useTradeConfirmState } from './useTradeConfirmState'

jest.mock('legacy/state/application/hooks', () => ({ useCloseModals: jest.fn() }))
jest.mock('modules/account', () => ({ useCloseAccountModal: jest.fn() }))
jest.mock('modules/injectedWidget', () => ({ useCloseAllModalsRequest: jest.fn() }))
jest.mock('./useSetOrdersTableDrawerOpen', () => ({ useSetOrdersTableDrawerOpen: jest.fn() }))
jest.mock('./useTradeConfirmState', () => ({ useTradeConfirmState: jest.fn() }))
jest.mock('jotai', () => ({ ...jest.requireActual('jotai'), useAtomValue: jest.fn() }))
jest.mock('modules/erc20Approve', () => ({ approveProgressModalStateAtom: {} }))

const useCloseAllModalsRequestMock = jest.mocked(useCloseAllModalsRequest)

describe('useCloseModalsOnWidgetRequest', () => {
  const resetTradeScreens = jest.fn()
  const setOrdersTableDrawerOpen = jest.fn()
  const closeAccountModal = jest.fn()
  const closeAppModals = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useSetOrdersTableDrawerOpen).mockReturnValue(setOrdersTableDrawerOpen)
    jest.mocked(useCloseAccountModal).mockReturnValue(closeAccountModal)
    jest.mocked(useCloseModals).mockReturnValue(closeAppModals)
    mockWalletActions({ isTradeSigning: false, isApproving: false })
  })

  it('closes every modal on a new request', () => {
    useCloseAllModalsRequestMock.mockReturnValue(0)
    const { rerender } = renderHook(() => useCloseModalsOnWidgetRequest(resetTradeScreens))

    useCloseAllModalsRequestMock.mockReturnValue(1)
    rerender()

    expect(resetTradeScreens).toHaveBeenCalledTimes(1)
    expect(setOrdersTableDrawerOpen).toHaveBeenCalledWith(false)
    expect(closeAccountModal).toHaveBeenCalledTimes(1)
    expect(closeAppModals).toHaveBeenCalledTimes(1)
  })

  it('ignores a request made before the trade widget was mounted', () => {
    useCloseAllModalsRequestMock.mockReturnValue(3)
    const { rerender } = renderHook(() => useCloseModalsOnWidgetRequest(resetTradeScreens))

    rerender()

    expect(resetTradeScreens).not.toHaveBeenCalled()
    expect(setOrdersTableDrawerOpen).not.toHaveBeenCalled()
  })

  it.each([
    ['a trade', { isTradeSigning: true, isApproving: false }],
    ['an approval', { isTradeSigning: false, isApproving: true }],
  ])('keeps every modal while the wallet signs %s', (_, walletActions) => {
    mockWalletActions(walletActions)
    useCloseAllModalsRequestMock.mockReturnValue(0)
    const { rerender } = renderHook(() => useCloseModalsOnWidgetRequest(resetTradeScreens))

    useCloseAllModalsRequestMock.mockReturnValue(1)
    rerender()
    mockWalletActions({ isTradeSigning: false, isApproving: false })
    rerender()

    expect(resetTradeScreens).not.toHaveBeenCalled()
    expect(setOrdersTableDrawerOpen).not.toHaveBeenCalled()
    expect(closeAppModals).not.toHaveBeenCalled()
  })
})

function mockWalletActions({ isTradeSigning, isApproving }: { isTradeSigning: boolean; isApproving: boolean }): void {
  jest.mocked(useTradeConfirmState).mockReturnValue({
    pendingTrade: isTradeSigning ? {} : null,
  } as ReturnType<typeof useTradeConfirmState>)
  jest.mocked(useAtomValue).mockReturnValue({ approveInProgress: isApproving })
}
