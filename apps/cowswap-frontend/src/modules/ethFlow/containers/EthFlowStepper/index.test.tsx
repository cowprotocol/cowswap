import { ReactElement } from 'react'

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
        order: expect.objectContaining({
          state: 'FILLED',
        }),
      }),
    )
  })
})
