import React from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeStatus, CrossChainOrder } from '@cowprotocol/sdk-bridging'
import { useWalletInfo } from '@cowprotocol/wallet'

import { render, waitFor } from '@testing-library/react'
import { useCrossChainOrder, usePendingBridgeOrders, useUpdateBridgeOrderQuote } from 'entities/bridgeOrders'
import { useAddOrderToSurplusQueue } from 'entities/surplusModal'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { PendingBridgeOrdersUpdater } from './PendingBridgeOrdersUpdater'

jest.mock('@cowprotocol/analytics', () => ({
  __resetGtmInstance: jest.fn(),
  useCowAnalytics: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('appzi', () => ({
  isOrderInPendingTooLong: jest.fn(),
  triggerAppziSurvey: jest.fn(),
}))

jest.mock('entities/bridgeOrders', () => ({
  useCrossChainOrder: jest.fn(),
  usePendingBridgeOrders: jest.fn(),
  useUpdateBridgeOrderQuote: jest.fn(),
}))

jest.mock('entities/surplusModal', () => ({
  useAddOrderToSurplusQueue: jest.fn(),
}))

jest.mock('modules/orders', () => ({
  emitBridgingSuccessEvent: jest.fn(),
}))

jest.mock('modules/sounds', () => ({
  getCowSoundError: jest.fn(() => ({ play: jest.fn() })),
  getCowSoundSuccess: jest.fn(() => ({ play: jest.fn() })),
}))

const sendEventMock = jest.fn()
const updateBridgeOrderQuoteMock = jest.fn()
const addOrderToSurplusQueueMock = jest.fn()

const useCowAnalyticsMock = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const usePendingBridgeOrdersMock = usePendingBridgeOrders as jest.MockedFunction<typeof usePendingBridgeOrders>
const useCrossChainOrderMock = useCrossChainOrder as jest.MockedFunction<typeof useCrossChainOrder>
const useUpdateBridgeOrderQuoteMock = useUpdateBridgeOrderQuote as jest.MockedFunction<typeof useUpdateBridgeOrderQuote>
const useAddOrderToSurplusQueueMock = useAddOrderToSurplusQueue as jest.MockedFunction<typeof useAddOrderToSurplusQueue>

describe('PendingBridgeOrdersUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useCowAnalyticsMock.mockReturnValue({
      sendEvent: sendEventMock,
    } as unknown as ReturnType<typeof useCowAnalytics>)
    useWalletInfoMock.mockReturnValue({ chainId: SupportedChainId.MAINNET } as ReturnType<typeof useWalletInfo>)
    usePendingBridgeOrdersMock.mockReturnValue([
      { orderUid: '0xorder', creationTimestamp: 1700000000000 },
    ] as unknown as ReturnType<typeof usePendingBridgeOrders>)
    useUpdateBridgeOrderQuoteMock.mockReturnValue(updateBridgeOrderQuoteMock)
    useAddOrderToSurplusQueueMock.mockReturnValue(addOrderToSurplusQueueMock)
  })

  it('emits enriched bridge success analytics for executed orders', async () => {
    const crossChainOrder = buildCrossChainOrder(BridgeStatus.EXECUTED)

    useCrossChainOrderMock.mockReturnValue({ data: crossChainOrder } as ReturnType<typeof useCrossChainOrder>)

    render(<PendingBridgeOrdersUpdater />)

    await waitFor(() => {
      expect(sendEventMock).toHaveBeenCalledWith({
        category: CowSwapAnalyticsCategory.Bridge,
        action: 'bridging_succeeded',
        label: 'From: 1, to: 100',
        orderId: '0xorder',
        chainId: 1,
        isBridgeOrder: true,
        walletAddress: '0xowner',
        sourceChainId: 1,
        destinationChainId: 100,
        bridgeStatus: BridgeStatus.EXECUTED,
        explorerUrl: 'https://explorer.example/tx/0xfill',
        depositTxHash: '0xdeposit',
        fillTxHash: '0xfill',
        providerName: 'Across',
        providerType: 'HookBridgeProvider',
        providerDappId: 'across',
      })
    })
    expect(updateBridgeOrderQuoteMock).toHaveBeenCalledWith('0xorder', crossChainOrder.statusResult)
    expect(addOrderToSurplusQueueMock).toHaveBeenCalledWith('0xorder')
  })

  it('emits enriched bridge failure analytics for failed orders', async () => {
    const crossChainOrder = buildCrossChainOrder(BridgeStatus.REFUND)

    useCrossChainOrderMock.mockReturnValue({ data: crossChainOrder } as ReturnType<typeof useCrossChainOrder>)

    render(<PendingBridgeOrdersUpdater />)

    await waitFor(() => {
      expect(sendEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          category: CowSwapAnalyticsCategory.Bridge,
          action: 'bridging_failed',
          orderId: '0xorder',
          bridgeStatus: BridgeStatus.REFUND,
          explorerUrl: 'https://explorer.example/tx/0xfill',
          depositTxHash: '0xdeposit',
          fillTxHash: '0xfill',
          providerName: 'Across',
          providerType: 'HookBridgeProvider',
          providerDappId: 'across',
        }),
      )
    })
    expect(addOrderToSurplusQueueMock).not.toHaveBeenCalled()
  })
})

function buildCrossChainOrder(status: BridgeStatus): CrossChainOrder {
  return {
    provider: {
      info: {
        name: 'Across',
        logoUrl: 'https://across.example/logo.svg',
        dappId: 'across',
        website: 'https://across.example',
        type: 'HookBridgeProvider',
      },
    },
    chainId: SupportedChainId.MAINNET,
    order: {
      uid: '0xorder',
      owner: '0xowner',
    },
    statusResult: {
      status,
      depositTxHash: '0xdeposit',
      fillTxHash: '0xfill',
    },
    bridgingParams: {
      sourceChainId: 1,
      destinationChainId: 100,
    },
    tradeTxHash: '0xtrade',
    explorerUrl: 'https://explorer.example/tx/0xfill',
  } as unknown as CrossChainOrder
}
