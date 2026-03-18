import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { render, waitFor } from '@testing-library/react'
import { useMarkSurplusOrderDisplayed } from 'entities/surplusModal'

import { useOrder } from 'legacy/state/orders/hooks'

import { useNavigateToNewOrderCallback, useTradeConfirmState } from 'modules/trade'

import { ActivityStatus } from 'common/types/activity'

import { OrderSubmittedContent } from './OrderSubmittedContent'

import { OrderProgressBarStepName } from '../constants'
import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('entities/surplusModal', () => ({
  useMarkSurplusOrderDisplayed: jest.fn(),
}))

jest.mock('legacy/state/orders/hooks', () => ({
  useOrder: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  useNavigateToNewOrderCallback: jest.fn(),
  useTradeConfirmState: jest.fn(),
}))

jest.mock('common/types/activity', () => ({
  ActivityStatus: {
    CONFIRMED: 2,
    EXPIRED: 3,
    CANCELLED: 5,
  },
}))

jest.mock('../constants', () => ({
  OrderProgressBarStepName: {
    FINISHED: 'finished',
    EXECUTING: 'executing',
    CANCELLATION_FAILED: 'cancellationFailed',
    BRIDGING_IN_PROGRESS: 'bridgingInProgress',
    BRIDGING_FINISHED: 'bridgingFinished',
    REFUND_COMPLETED: 'refundCompleted',
  },
}))

jest.mock('../hooks/useOrderProgressBarProps', () => ({
  useOrderProgressBarProps: jest.fn(),
}))

jest.mock('../pure/TransactionSubmittedContent', () => ({
  TransactionSubmittedContent: () => <div data-testid="transaction-submitted-content" />,
}))

const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useMarkSurplusOrderDisplayedMock = useMarkSurplusOrderDisplayed as jest.MockedFunction<
  typeof useMarkSurplusOrderDisplayed
>
const useOrderMock = useOrder as jest.MockedFunction<typeof useOrder>
const useNavigateToNewOrderCallbackMock = useNavigateToNewOrderCallback as jest.MockedFunction<
  typeof useNavigateToNewOrderCallback
>
const useTradeConfirmStateMock = useTradeConfirmState as jest.MockedFunction<typeof useTradeConfirmState>
const useOrderProgressBarPropsMock = useOrderProgressBarProps as jest.MockedFunction<typeof useOrderProgressBarProps>

const order = { id: 'order-1' } as never

describe('OrderSubmittedContent', () => {
  beforeEach(() => {
    useWalletInfoMock.mockReturnValue({ chainId: SupportedChainId.MAINNET } as never)
    useTradeConfirmStateMock.mockReturnValue({ transactionHash: 'order-1' } as never)
    useOrderMock.mockReturnValue(order)
    useNavigateToNewOrderCallbackMock.mockReturnValue(jest.fn())
    useMarkSurplusOrderDisplayedMock.mockReturnValue(jest.fn())
    useOrderProgressBarPropsMock.mockReturnValue({
      props: {
        chainId: SupportedChainId.MAINNET,
        stepName: OrderProgressBarStepName.EXECUTING,
        isProgressBarSetup: true,
        isBridgingTrade: false,
        showCancellationModal: null,
      } as never,
      activityDerivedState: {
        status: ActivityStatus.CANCELLED,
      } as never,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('marks the order as already shown when the live modal is displaying the final filled outcome', async () => {
    const markOrderDisplayed = jest.fn()

    useMarkSurplusOrderDisplayedMock.mockReturnValue(markOrderDisplayed)
    useOrderProgressBarPropsMock.mockReturnValue({
      props: {
        chainId: SupportedChainId.MAINNET,
        stepName: OrderProgressBarStepName.CANCELLATION_FAILED,
        isProgressBarSetup: true,
        isBridgingTrade: false,
        showCancellationModal: null,
      } as never,
      activityDerivedState: {
        status: ActivityStatus.CANCELLED,
      } as never,
    })

    render(<OrderSubmittedContent onDismiss={jest.fn()} />)

    await waitFor(() => {
      expect(markOrderDisplayed).toHaveBeenCalledWith('order-1')
    })
  })

  it('does not mark bridge orders as shown while bridging is still in progress', async () => {
    const markOrderDisplayed = jest.fn()

    useMarkSurplusOrderDisplayedMock.mockReturnValue(markOrderDisplayed)
    useOrderProgressBarPropsMock.mockReturnValue({
      props: {
        chainId: SupportedChainId.MAINNET,
        stepName: OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
        isProgressBarSetup: true,
        isBridgingTrade: true,
        showCancellationModal: null,
      } as never,
      activityDerivedState: {
        status: ActivityStatus.CONFIRMED,
      } as never,
    })

    render(<OrderSubmittedContent onDismiss={jest.fn()} />)

    await waitFor(() => {
      expect(markOrderDisplayed).not.toHaveBeenCalled()
    })
  })

  it('marks bridge orders as shown when the bridge flow reaches a terminal step', async () => {
    const markOrderDisplayed = jest.fn()

    useMarkSurplusOrderDisplayedMock.mockReturnValue(markOrderDisplayed)
    useOrderProgressBarPropsMock.mockReturnValue({
      props: {
        chainId: SupportedChainId.MAINNET,
        stepName: OrderProgressBarStepName.BRIDGING_FINISHED,
        isProgressBarSetup: true,
        isBridgingTrade: true,
        showCancellationModal: null,
      } as never,
      activityDerivedState: {
        status: ActivityStatus.CONFIRMED,
      } as never,
    })

    render(<OrderSubmittedContent onDismiss={jest.fn()} />)

    await waitFor(() => {
      expect(markOrderDisplayed).toHaveBeenCalledWith('order-1')
    })
  })
})
