import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { act, renderHook, RenderHookResult } from '@testing-library/react'
import ms from 'ms.macro'

import { OrderExpiryWarningState, useOrderExpiryWarning } from './useOrderExpiryWarning'

import { updateLimitOrdersSettingsAtom } from '../state/limitOrdersSettingsAtom'
import { OrderExpiryWarningTier } from '../utils/getOrderExpiryWarningTier.utils'
import { logOrderExpiryWarningAcknowledgement } from '../utils/logOrderExpiryWarningAcknowledgement.utils'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
}))
jest.mock('../utils/logOrderExpiryWarningAcknowledgement.utils')

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockLogAcknowledgement = logOrderExpiryWarningAcknowledgement as jest.MockedFunction<
  typeof logOrderExpiryWarningAcknowledgement
>

const account = '0x1111111111111111111111111111111111111111'

function renderWithDeadline(deadlineMilliseconds: number): RenderHookResult<OrderExpiryWarningState, unknown> {
  const store = createStore()
  store.set(updateLimitOrdersSettingsAtom, { deadlineMilliseconds, customDeadlineTimestamp: null })

  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>

  return renderHook(() => useOrderExpiryWarning(), { wrapper })
}

describe('useOrderExpiryWarning()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWalletInfo.mockReturnValue({ account, chainId: SupportedChainId.MAINNET } as ReturnType<
      typeof useWalletInfo
    >)
  })

  it.each([
    [ms`1d`, OrderExpiryWarningTier.None],
    [ms`7d`, OrderExpiryWarningTier.Subtle],
  ])('does not block confirmation for a %i ms deadline', (deadlineMs, expectedTier) => {
    const { result } = renderWithDeadline(deadlineMs)

    expect(result.current.tier).toBe(expectedTier)
    expect(result.current.isBlocking).toBe(false)
  })

  it('blocks confirmation for a long-lived order until the warning is acknowledged', () => {
    const { result } = renderWithDeadline(ms`30d`)

    expect(result.current.tier).toBe(OrderExpiryWarningTier.Prominent)
    expect(result.current.isAccepted).toBe(false)
    expect(result.current.isBlocking).toBe(true)

    act(() => result.current.onAcknowledgeChange(true))

    expect(result.current.isAccepted).toBe(true)
    expect(result.current.isBlocking).toBe(false)

    act(() => result.current.onAcknowledgeChange(false))

    expect(result.current.isAccepted).toBe(false)
    expect(result.current.isBlocking).toBe(true)
  })

  it('logs every acknowledgement change with the order context', () => {
    const { result } = renderWithDeadline(ms`30d`)

    act(() => result.current.onAcknowledgeChange(true))
    act(() => result.current.onAcknowledgeChange(false))

    expect(mockLogAcknowledgement).toHaveBeenNthCalledWith(1, {
      isAccepted: true,
      tier: OrderExpiryWarningTier.Prominent,
      deadlineDurationMs: ms`30d`,
      chainId: SupportedChainId.MAINNET,
      account,
    })
    expect(mockLogAcknowledgement).toHaveBeenNthCalledWith(2, expect.objectContaining({ isAccepted: false }))
  })
})
