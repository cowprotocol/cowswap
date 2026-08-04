import { useCowAnalytics } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'

import { renderHook } from '@testing-library/react'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { TradeFlowAnalytics, useTradeFlowAnalytics } from './tradeFlowAnalytics'

jest.mock('@cowprotocol/analytics', () => {
  const actualModule = jest.requireActual('@cowprotocol/analytics')

  return {
    ...actualModule,
    __resetGtmInstance: jest.fn(),
    useCowAnalytics: jest.fn(),
  }
})

const useCowAnalyticsMock = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>

const PRE_SIGNATURE_METHODS: Array<{
  method: 'trade' | 'placeAdvancedOrder' | 'approveAndPresign' | 'wrapApproveAndPresign'
  action: string
}> = [
  { method: 'trade', action: 'Send' },
  { method: 'placeAdvancedOrder', action: 'Place Advanced Order' },
  { method: 'approveAndPresign', action: 'Bundle Approve and Swap' },
  { method: 'wrapApproveAndPresign', action: 'Bundled Eth Flow' },
]

describe.each(PRE_SIGNATURE_METHODS)('useTradeFlowAnalytics.$method', ({ method, action }) => {
  const sendEvent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useCowAnalyticsMock.mockReturnValue({ sendEvent } as unknown as ReturnType<typeof useCowAnalytics>)
  })

  function call(context: Parameters<TradeFlowAnalytics[typeof method]>[0]): void {
    const { result } = renderHook(() => useTradeFlowAnalytics())
    result.current[method](context)
  }

  it(`includes quoteId and allowsOffchainSigning on the ${action} event when provided`, () => {
    call({
      account: '0xaccount',
      orderType: UiOrderType.SWAP,
      marketLabel: 'WETH,COW',
      quoteId: 123,
      allowsOffchainSigning: true,
    })

    expect(sendEvent).toHaveBeenCalledWith({
      category: CowSwapAnalyticsCategory.TRADE,
      action,
      label: `${UiOrderType.SWAP}|WETH,COW`,
      isBridgeOrder: undefined,
      quoteId: 123,
      allowsOffchainSigning: true,
    })
  })

  it('omits quoteId and allowsOffchainSigning when not provided', () => {
    call({
      account: '0xaccount',
      orderType: UiOrderType.SWAP,
      marketLabel: 'WETH,COW',
    })

    const payload = sendEvent.mock.calls[0]?.[0] as Record<string, unknown>

    expect(payload).not.toHaveProperty('quoteId')
    expect(payload).not.toHaveProperty('allowsOffchainSigning')
  })
})
