import { ReactElement } from 'react'

import { OrderStatus as ApiOrderStatus } from '@cowprotocol/cow-sdk'

import { render } from '@testing-library/react'

import { useAllTransactions } from 'legacy/state/enhancedTransactions/hooks'
import { OrderStatus } from 'legacy/state/orders/actions'

import { EthFlowStepper } from './index'

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  getIsNativeToken: jest.fn(() => true),
}))

jest.mock('legacy/state/enhancedTransactions/hooks', () => ({
  useAllTransactions: jest.fn(),
}))

jest.mock('lib/hooks/useNativeCurrency', () => ({
  __esModule: true,
  default: jest.fn(() => ({ symbol: 'ETH' })),
}))

const mockPureStepper = jest.fn((_: unknown) => null as ReactElement | null)

jest.mock('../../pure/EthFlowStepper', () => ({
  EthFlowStepper: (props: unknown) => mockPureStepper(props),
  SmartOrderStatus: {},
}))

const useAllTransactionsMock = useAllTransactions as jest.MockedFunction<typeof useAllTransactions>

describe('EthFlowStepper', () => {
  beforeEach(() => {
    useAllTransactionsMock.mockReturnValue({
      '0xcancel': {
        receipt: { status: 1 },
      },
    } as never)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('prefers fill evidence over cancelled EthFlow state', () => {
    render(
      <EthFlowStepper
        order={
          {
            id: 'order-1',
            kind: 'sell',
            status: OrderStatus.CANCELLED,
            buyAmount: '1000',
            sellAmount: '100',
            validTo: 0,
            inputToken: { symbol: 'ETH', isNative: true } as never,
            outputToken: { symbol: 'USDC' } as never,
            apiAdditionalInfo: {
              executedSellAmount: '95',
              executedSellAmountBeforeFees: '100',
              executedFeeAmount: '5',
              executedBuyAmount: '1010',
            },
            cancellationHash: '0xcancel',
          } as never
        }
      />,
    )

    expect(mockPureStepper).toHaveBeenCalledWith(
      expect.objectContaining({
        cancellation: expect.objectContaining({
          failed: undefined,
        }),
        order: expect.objectContaining({
          state: 'FILLED',
        }),
      }),
    )
  })

  it('keeps cancellation outcome unresolved until backend confirms EthFlow cancellation', () => {
    render(
      <EthFlowStepper
        order={
          {
            id: 'order-2',
            kind: 'sell',
            status: OrderStatus.CANCELLED,
            buyAmount: '1000',
            sellAmount: '100',
            validTo: 0,
            inputToken: { symbol: 'ETH', isNative: true } as never,
            outputToken: { symbol: 'USDC' } as never,
            apiAdditionalInfo: {
              status: OrderStatus.PENDING,
              executedSellAmount: '0',
              executedSellAmountBeforeFees: '0',
              executedFeeAmount: '0',
              executedBuyAmount: '0',
            },
            cancellationHash: '0xcancel',
          } as never
        }
      />,
    )

    expect(mockPureStepper).toHaveBeenCalledWith(
      expect.objectContaining({
        cancellation: expect.objectContaining({
          failed: undefined,
        }),
        refund: expect.objectContaining({
          failed: undefined,
        }),
      }),
    )
  })

  it('shows confirmed EthFlow cancellations once the backend marks the order cancelled', () => {
    render(
      <EthFlowStepper
        order={
          {
            id: 'order-3',
            kind: 'sell',
            status: OrderStatus.CANCELLED,
            buyAmount: '1000',
            sellAmount: '100',
            validTo: 0,
            inputToken: { symbol: 'ETH', isNative: true } as never,
            outputToken: { symbol: 'USDC' } as never,
            apiAdditionalInfo: {
              status: ApiOrderStatus.CANCELLED,
              executedSellAmount: '0',
              executedSellAmountBeforeFees: '0',
              executedFeeAmount: '0',
              executedBuyAmount: '0',
            },
            cancellationHash: '0xcancel',
          } as never
        }
      />,
    )

    expect(mockPureStepper).toHaveBeenCalledWith(
      expect.objectContaining({
        cancellation: expect.objectContaining({
          failed: false,
        }),
        refund: expect.objectContaining({
          failed: false,
        }),
      }),
    )
  })

  it('treats freshly created backend-cancelled EthFlow orders as confirmed cancellations', () => {
    render(
      <EthFlowStepper
        order={
          {
            id: 'order-3b',
            kind: 'sell',
            status: OrderStatus.CANCELLED,
            buyAmount: '1000',
            sellAmount: '100',
            validTo: 0,
            inputToken: { symbol: 'ETH', isNative: true } as never,
            outputToken: { symbol: 'USDC' } as never,
            apiAdditionalInfo: {
              status: ApiOrderStatus.CANCELLED,
              creationDate: new Date().toISOString(),
              invalidated: true,
              validTo: Math.floor(Date.now() / 1000) + 60,
              executedSellAmount: '0',
              executedSellAmountBeforeFees: '0',
              executedFeeAmount: '0',
              executedBuyAmount: '0',
            },
            cancellationHash: '0xcancel',
          } as never
        }
      />,
    )

    expect(mockPureStepper).toHaveBeenCalledWith(
      expect.objectContaining({
        cancellation: expect.objectContaining({
          failed: false,
        }),
      }),
    )
  })

  it('does not treat expired and refunded EthFlow orders as confirmed cancellations', () => {
    render(
      <EthFlowStepper
        order={
          {
            id: 'order-4',
            kind: 'sell',
            status: OrderStatus.EXPIRED,
            buyAmount: '1000',
            sellAmount: '100',
            validTo: 0,
            isRefunded: true,
            refundHash: '0xrefund',
            inputToken: { symbol: 'ETH', isNative: true } as never,
            outputToken: { symbol: 'USDC' } as never,
            apiAdditionalInfo: {
              status: OrderStatus.EXPIRED,
              executedSellAmount: '0',
              executedSellAmountBeforeFees: '0',
              executedFeeAmount: '0',
              executedBuyAmount: '0',
            },
          } as never
        }
      />,
    )

    expect(mockPureStepper).toHaveBeenCalledWith(
      expect.objectContaining({
        cancellation: expect.objectContaining({
          failed: undefined,
        }),
        refund: expect.objectContaining({
          failed: false,
        }),
      }),
    )
  })
})
