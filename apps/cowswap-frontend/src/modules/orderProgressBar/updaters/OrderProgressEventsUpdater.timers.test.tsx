import { Provider as JotaiProvider } from 'jotai'
import { createStore } from 'jotai/vanilla'
import { ReactNode } from 'react'

import { type EnrichedOrder, OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowWidgetEvents, type OnFulfilledOrderPayload } from '@cowprotocol/events'
import { useWalletInfo } from '@cowprotocol/wallet'

import { act, render } from '@testing-library/react'
import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import type { Order } from 'legacy/state/orders/actions'
import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { usePendingOrdersFillability } from 'modules/ordersTable'

import { OrderProgressEventsUpdater } from './OrderProgressEventsUpdater'
import { EXECUTING_STEP_MIN_DISPLAY_TIME_MS } from './utils'

import { OrderProgressBarStepName } from '../constants'
import { MINIMUM_STEP_DISPLAY_TIME } from '../hooks/useOrderProgressBarProps'
import { ordersProgressBarStateAtom } from '../state/atoms'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('legacy/state/orders/hooks', () => ({
  useOnlyPendingOrders: jest.fn(),
}))

jest.mock('modules/ordersTable', () => ({
  usePendingOrdersFillability: jest.fn(),
}))

const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useOnlyPendingOrdersMock = useOnlyPendingOrders as jest.MockedFunction<typeof useOnlyPendingOrders>
const usePendingOrdersFillabilityMock = usePendingOrdersFillability as jest.MockedFunction<
  typeof usePendingOrdersFillability
>

type WalletInfo = ReturnType<typeof useWalletInfo>

function getWrapper(): {
  store: ReturnType<typeof createStore>
  TestComponent: (props: { children: ReactNode }) => ReactNode
} {
  const store = createStore()

  function TestComponent({ children }: { children: ReactNode }): ReactNode {
    return <JotaiProvider store={store}>{children}</JotaiProvider>
  }

  return { store, TestComponent }
}

function emitFulfilledOrder(orderUid: string): void {
  const payload: OnFulfilledOrderPayload = {
    chainId: SupportedChainId.MAINNET,
    order: { uid: orderUid } as EnrichedOrder,
  }

  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_FULFILLED_ORDER, payload)
}

describe('OrderProgressEventsUpdater timer cleanup', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-04-09T12:00:00Z'))

    useWalletInfoMock.mockReturnValue({
      chainId: SupportedChainId.MAINNET,
      account: '0xabc',
    } as unknown as WalletInfo)
    usePendingOrdersFillabilityMock.mockReturnValue({})
  })

  afterEach(() => {
    act(() => {
      jest.clearAllTimers()
    })
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('clears a queued unfillable timer when the order becomes fillable again before it fires', () => {
    const orderUid = '0xrecovering-order'
    const order = { id: orderUid, class: OrderClass.MARKET, isUnfillable: true } as Order
    const { store, TestComponent } = getWrapper()

    useOnlyPendingOrdersMock.mockReturnValue([order])
    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        lastTimeChangedSteps: Date.now(),
        previousStepName: OrderProgressBarStepName.INITIAL,
        progressBarStepName: OrderProgressBarStepName.SOLVING,
      },
    })

    const { rerender, unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    useOnlyPendingOrdersMock.mockReturnValue([{ ...order, isUnfillable: false } as Order])

    act(() => {
      rerender(<OrderProgressEventsUpdater />)
    })

    act(() => {
      jest.advanceTimersByTime(MINIMUM_STEP_DISPLAY_TIME)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]).toMatchObject({
      previousStepName: OrderProgressBarStepName.INITIAL,
      progressBarStepName: OrderProgressBarStepName.SOLVING,
    })

    unmount()
  })

  it('keeps a queued completion timer when a fulfilled order also becomes newly fillable', () => {
    const orderUid = '0xfulfilled-unfillable-order'
    const order = { id: orderUid, class: OrderClass.MARKET, isUnfillable: true } as Order
    const { store, TestComponent } = getWrapper()

    useOnlyPendingOrdersMock.mockReturnValue([order])
    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        previousStepName: OrderProgressBarStepName.SOLVING,
        progressBarStepName: OrderProgressBarStepName.UNFILLABLE,
      },
    })

    const { rerender, unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    act(() => {
      emitFulfilledOrder(orderUid)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(
      OrderProgressBarStepName.EXECUTING,
    )

    useOnlyPendingOrdersMock.mockReturnValue([{ ...order, isUnfillable: false } as Order])

    act(() => {
      rerender(<OrderProgressEventsUpdater />)
    })

    act(() => {
      jest.advanceTimersByTime(EXECUTING_STEP_MIN_DISPLAY_TIME_MS + 1)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(OrderProgressBarStepName.FINISHED)

    unmount()
  })
})
