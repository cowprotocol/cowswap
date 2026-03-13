import { ReactNode } from 'react'

import { OrderClass, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'

import { render, screen } from '@testing-library/react'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { ActivityDerivedState, ActivityStatus, ActivityType } from 'common/types/activity'

import { TransactionSubmittedContent, type TransactionSubmittedContentProps } from './index'

const mockEthFlowStepper = jest.fn((_: unknown) => <div data-testid="eth-flow-stepper" />)
const mockIsOrderFilled = jest.fn()

jest.mock('@cowprotocol/ui', () => ({
  BackButton: ({ onClick }: { onClick: () => void }) => <button onClick={onClick}>Back</button>,
}))

jest.mock('legacy/components/TransactionConfirmationModal/DisplayLink', () => ({
  DisplayLink: () => <div data-testid="display-link" />,
}))

jest.mock('modules/account', () => ({
  GnosisSafeTxDetails: () => null,
}))

jest.mock('modules/ethFlow', () => ({
  EthFlowStepper: (props: unknown) => mockEthFlowStepper(props),
}))

jest.mock('modules/wallet', () => ({
  WatchAssetInWallet: () => <div data-testid="watch-asset" />,
}))

jest.mock('common/pure/CancelButton', () => ({
  CancelButton: ({ children, onClick }: { children?: ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children || 'Cancel'}</button>
  ),
}))

jest.mock('common/utils/getIsBridgeOrder', () => ({
  getIsBridgeOrder: jest.fn(() => false),
}))

jest.mock('utils/orderUtils/isOrderFilled', () => ({
  isOrderFilled: (...args: unknown[]) => mockIsOrderFilled(...args),
}))

jest.mock('./styled', () => ({
  Wrapper: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Section: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  Header: ({ children }: { children: ReactNode }) => <header>{children}</header>,
  ActionsWrapper: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ButtonGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ButtonCustom: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  ButtonSecondary: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Title: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

jest.mock('../OrderProgressBar', () => ({
  OrderProgressBar: () => <div data-testid="order-progress-bar" />,
}))

function createActivityDerivedState(order: Order): ActivityDerivedState {
  return {
    id: order.id,
    status: ActivityStatus.CANCELLED,
    type: ActivityType.ORDER,
    isTransaction: false,
    isOrder: true,
    isPending: false,
    isConfirmed: false,
    isExpired: false,
    isCancelling: false,
    isCancelled: true,
    isReplaced: false,
    isPresignaturePending: false,
    isCreating: false,
    isFailed: false,
    order,
  }
}

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    owner: '0xabc',
    status: OrderStatus.CANCELLED,
    creationTime: '2026-03-12T18:00:00.000Z',
    inputToken: { symbol: 'ETH' } as Order['inputToken'],
    outputToken: { symbol: 'USDC' } as Order['outputToken'],
    sellToken: '0xsell',
    buyToken: '0xbuy',
    sellAmount: '1000',
    sellAmountBeforeFee: '1000',
    buyAmount: '900',
    validTo: 0,
    appData: '0xapp',
    feeAmount: '0',
    kind: OrderKind.SELL,
    partiallyFillable: false,
    signature: '0xsig',
    signingScheme: SigningScheme.EIP712,
    receiver: '0xabc',
    class: OrderClass.MARKET,
    ...overrides,
  } as unknown as Order
}

function createOrderProgressBarProps(order: Order): TransactionSubmittedContentProps['orderProgressBarProps'] {
  return {
    chainId: SupportedChainId.MAINNET,
    order,
    showCancellationModal: null,
    isProgressBarSetup: true,
    isBridgingTrade: false,
  }
}

describe('TransactionSubmittedContent', () => {
  beforeEach(() => {
    mockEthFlowStepper.mockClear()
    mockIsOrderFilled.mockReset()
  })

  it('hides the EthFlow stepper when a stale cancelled order already has fill evidence', () => {
    mockIsOrderFilled.mockReturnValue(true)

    const order = createOrder({
      apiAdditionalInfo: {
        executedSellAmount: '1000',
        executedBuyAmount: '1000',
        executedFeeAmount: '0',
      } as Order['apiAdditionalInfo'],
    })

    render(
      <TransactionSubmittedContent
        onDismiss={jest.fn()}
        chainId={SupportedChainId.MAINNET}
        hash="0xhash"
        activityDerivedState={createActivityDerivedState(order)}
        orderProgressBarProps={createOrderProgressBarProps(order)}
      />,
    )

    expect(screen.queryByTestId('eth-flow-stepper')).toBeNull()
    expect(screen.getByTestId('order-progress-bar')).not.toBeNull()
  })

  it('still shows the EthFlow stepper while the order is not effectively filled', () => {
    mockIsOrderFilled.mockReturnValue(false)

    const order = createOrder()

    render(
      <TransactionSubmittedContent
        onDismiss={jest.fn()}
        chainId={SupportedChainId.MAINNET}
        hash="0xhash"
        activityDerivedState={createActivityDerivedState(order)}
        orderProgressBarProps={createOrderProgressBarProps(order)}
      />,
    )

    expect(screen.getByTestId('eth-flow-stepper')).not.toBeNull()
  })
})
