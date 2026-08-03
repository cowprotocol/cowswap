import { useCowAnalytics } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'

import { renderHook } from '@testing-library/react'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { useTradeFlowAnalytics } from './tradeFlowAnalytics'

jest.mock('@cowprotocol/analytics', () => {
  const actualModule = jest.requireActual('@cowprotocol/analytics')

  return {
    ...actualModule,
    __resetGtmInstance: jest.fn(),
    useCowAnalytics: jest.fn(),
  }
})

const useCowAnalyticsMock = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>

describe('useTradeFlowAnalytics.trade', () => {
  const sendEvent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useCowAnalyticsMock.mockReturnValue({ sendEvent } as unknown as ReturnType<typeof useCowAnalytics>)
  })

  it('includes quoteId and allowsOffchainSigning on the Send event when provided', () => {
    const { result } = renderHook(() => useTradeFlowAnalytics())

    result.current.trade({
      account: '0xaccount',
      orderType: UiOrderType.SWAP,
      marketLabel: 'WETH,COW',
      quoteId: 123,
      allowsOffchainSigning: true,
    })

    expect(sendEvent).toHaveBeenCalledWith({
      category: CowSwapAnalyticsCategory.TRADE,
      action: 'Send',
      label: `${UiOrderType.SWAP}|WETH,COW`,
      isBridgeOrder: undefined,
      quoteId: 123,
      allowsOffchainSigning: true,
    })
  })

  it('omits quoteId and allowsOffchainSigning when not provided', () => {
    const { result } = renderHook(() => useTradeFlowAnalytics())

    result.current.trade({
      account: '0xaccount',
      orderType: UiOrderType.SWAP,
      marketLabel: 'WETH,COW',
    })

    const payload = sendEvent.mock.calls[0]?.[0] as Record<string, unknown>

    expect(payload).not.toHaveProperty('quoteId')
    expect(payload).not.toHaveProperty('allowsOffchainSigning')
  })
})
