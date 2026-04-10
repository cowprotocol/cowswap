import { Provider as JotaiProvider } from 'jotai'
import { createStore } from 'jotai/vanilla'
import { ReactNode } from 'react'

import { type EnrichedOrder, OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowWidgetEvents, type OnBridgingSuccessPayload, type OnFulfilledOrderPayload } from '@cowprotocol/events'
import { type BridgeOrderDataSerialized } from '@cowprotocol/types'
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

function emitFulfilledOrder(orderUid: string, bridgeOrder?: BridgeOrderDataSerialized): void {
  const payload: OnFulfilledOrderPayload = {
    chainId: SupportedChainId.MAINNET,
    order: { uid: orderUid } as EnrichedOrder,
    bridgeOrder,
  }

  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_FULFILLED_ORDER, payload)
}

function emitBridgingSuccess(orderUid: string): void {
  const payload = {
    chainId: SupportedChainId.MAINNET,
    order: { uid: orderUid } as EnrichedOrder,
  } as unknown as OnBridgingSuccessPayload

  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_BRIDGING_SUCCESS, payload)
}

describe('OrderProgressEventsUpdater', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-04-08T12:00:00Z'))

    useWalletInfoMock.mockReturnValue({
      chainId: SupportedChainId.MAINNET,
      account: '0xabc',
    } as unknown as WalletInfo)
    useOnlyPendingOrdersMock.mockReturnValue([] as Order[])
    usePendingOrdersFillabilityMock.mockReturnValue({})
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('stages executing before finishing fulfilled orders and clears the countdown', () => {
    const orderUid = '0xorder'
    const { store, TestComponent } = getWrapper()

    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        countdown: 12,
        progressBarStepName: OrderProgressBarStepName.SOLVING,
        previousStepName: OrderProgressBarStepName.INITIAL,
      },
    })

    const { unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    act(() => emitFulfilledOrder(orderUid))

    expect(store.get(ordersProgressBarStateAtom)[orderUid]).toMatchObject({
      previousStepName: OrderProgressBarStepName.SOLVING,
      progressBarStepName: OrderProgressBarStepName.EXECUTING,
    })
    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.countdown).toBeUndefined()

    act(() => {
      jest.advanceTimersByTime(EXECUTING_STEP_MIN_DISPLAY_TIME_MS - 1)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(
      OrderProgressBarStepName.EXECUTING,
    )

    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]).toMatchObject({
      previousStepName: OrderProgressBarStepName.EXECUTING,
      progressBarStepName: OrderProgressBarStepName.FINISHED,
    })

    unmount()
  })

  it('stages executing before entering bridge progress when the fulfilled event includes a bridge order', () => {
    const orderUid = '0xbridge-order'
    const { store, TestComponent } = getWrapper()

    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        progressBarStepName: OrderProgressBarStepName.SOLVING,
        previousStepName: OrderProgressBarStepName.INITIAL,
      },
    })

    const { unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    act(() => emitFulfilledOrder(orderUid, {} as BridgeOrderDataSerialized))

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(
      OrderProgressBarStepName.EXECUTING,
    )

    act(() => {
      jest.advanceTimersByTime(EXECUTING_STEP_MIN_DISPLAY_TIME_MS)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]).toMatchObject({
      previousStepName: OrderProgressBarStepName.EXECUTING,
      progressBarStepName: OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
    })

    unmount()
  })

  it('applies bridge completion immediately when the bridge success event arrives', () => {
    const orderUid = '0xbridge-finished'
    const { store, TestComponent } = getWrapper()

    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        lastTimeChangedSteps: Date.now(),
        previousStepName: OrderProgressBarStepName.EXECUTING,
        progressBarStepName: OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
      },
    })

    const { unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    act(() => emitBridgingSuccess(orderUid))

    expect(store.get(ordersProgressBarStateAtom)[orderUid]).toMatchObject({
      previousStepName: OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
      progressBarStepName: OrderProgressBarStepName.BRIDGING_FINISHED,
    })

    act(() => {
      jest.advanceTimersByTime(MINIMUM_STEP_DISPLAY_TIME)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(
      OrderProgressBarStepName.BRIDGING_FINISHED,
    )

    unmount()
  })

  it('does not stage executing when a fulfilled event arrives before the bar leaves the initial step', () => {
    const orderUid = '0xinitial-order'
    const { store, TestComponent } = getWrapper()

    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        progressBarStepName: OrderProgressBarStepName.INITIAL,
      },
    })

    const { unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    act(() => emitFulfilledOrder(orderUid))

    expect(store.get(ordersProgressBarStateAtom)[orderUid]).toMatchObject({
      previousStepName: OrderProgressBarStepName.INITIAL,
      progressBarStepName: OrderProgressBarStepName.FINISHED,
    })

    act(() => {
      jest.advanceTimersByTime(EXECUTING_STEP_MIN_DISPLAY_TIME_MS)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(OrderProgressBarStepName.FINISHED)

    unmount()
  })

  it('does not overwrite a newer step after the delayed completion timer fires', () => {
    const orderUid = '0xcancelled-order'
    const { store, TestComponent } = getWrapper()

    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        progressBarStepName: OrderProgressBarStepName.SOLVING,
        previousStepName: OrderProgressBarStepName.INITIAL,
      },
    })

    const { unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    act(() => emitFulfilledOrder(orderUid))
    act(() => {
      store.set(ordersProgressBarStateAtom, {
        [orderUid]: {
          progressBarStepName: OrderProgressBarStepName.CANCELLATION_FAILED,
          previousStepName: OrderProgressBarStepName.EXECUTING,
        },
      })
    })

    act(() => {
      jest.advanceTimersByTime(EXECUTING_STEP_MIN_DISPLAY_TIME_MS)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]).toMatchObject({
      previousStepName: OrderProgressBarStepName.EXECUTING,
      progressBarStepName: OrderProgressBarStepName.CANCELLATION_FAILED,
    })

    unmount()
  })

  it('does not recreate pruned state after the delayed completion timer fires', () => {
    const orderUid = '0xpruned-order'
    const { store, TestComponent } = getWrapper()

    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        progressBarStepName: OrderProgressBarStepName.SOLVING,
        previousStepName: OrderProgressBarStepName.INITIAL,
      },
    })

    const { unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    act(() => emitFulfilledOrder(orderUid))
    act(() => {
      store.set(ordersProgressBarStateAtom, {})
    })

    act(() => {
      jest.advanceTimersByTime(EXECUTING_STEP_MIN_DISPLAY_TIME_MS)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]).toBeUndefined()

    unmount()
  })

  it('replays executing before finishing after a submission retry path', () => {
    const orderUid = '0xretry-order'
    const { store, TestComponent } = getWrapper()

    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        progressBarStepName: OrderProgressBarStepName.SOLVING,
        previousStepName: OrderProgressBarStepName.EXECUTING,
      },
    })

    const { unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    act(() => emitFulfilledOrder(orderUid))

    expect(store.get(ordersProgressBarStateAtom)[orderUid]).toMatchObject({
      previousStepName: OrderProgressBarStepName.SOLVING,
      progressBarStepName: OrderProgressBarStepName.EXECUTING,
      hasShownExecutingInCurrentAttempt: true,
    })

    act(() => {
      jest.advanceTimersByTime(EXECUTING_STEP_MIN_DISPLAY_TIME_MS)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]).toMatchObject({
      previousStepName: OrderProgressBarStepName.EXECUTING,
      progressBarStepName: OrderProgressBarStepName.FINISHED,
    })

    unmount()
  })

  it('does not show unfillable before the progress bar leaves the initial step', () => {
    const orderUid = '0xinitial-unfillable'
    const pendingOrder = { id: orderUid, class: OrderClass.MARKET, isUnfillable: true } as Order
    const { store, TestComponent } = getWrapper()

    useOnlyPendingOrdersMock.mockReturnValue([pendingOrder])
    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        progressBarStepName: OrderProgressBarStepName.INITIAL,
      },
    })

    const { unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(OrderProgressBarStepName.INITIAL)

    act(() => {
      store.set(ordersProgressBarStateAtom, {
        [orderUid]: {
          progressBarStepName: OrderProgressBarStepName.SOLVING,
          previousStepName: OrderProgressBarStepName.INITIAL,
          lastTimeChangedSteps: Date.now(),
        },
      })
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(OrderProgressBarStepName.SOLVING)

    act(() => {
      jest.advanceTimersByTime(MINIMUM_STEP_DISPLAY_TIME - 1)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(OrderProgressBarStepName.SOLVING)

    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(
      OrderProgressBarStepName.UNFILLABLE,
    )

    unmount()
  })

  it('does not create a solving step when a deferred unfillable order recovers before being shown', () => {
    const orderUid = '0xrecovered-unfillable'
    const pendingOrder = { id: orderUid, class: OrderClass.MARKET, isUnfillable: true } as Order
    const { store, TestComponent } = getWrapper()

    useOnlyPendingOrdersMock.mockReturnValue([pendingOrder])
    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        progressBarStepName: OrderProgressBarStepName.INITIAL,
      },
    })

    const { rerender, unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(OrderProgressBarStepName.INITIAL)

    useOnlyPendingOrdersMock.mockReturnValue([])

    rerender(<OrderProgressEventsUpdater />)

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(OrderProgressBarStepName.INITIAL)

    unmount()
  })

  it('keeps the unfillable screen for the minimum display time before recovering to solving', () => {
    const orderUid = '0xunfillable-recovery'
    const pendingOrder = { id: orderUid, class: OrderClass.MARKET, isUnfillable: true } as Order
    const { store, TestComponent } = getWrapper()

    useOnlyPendingOrdersMock.mockReturnValue([pendingOrder])
    store.set(ordersProgressBarStateAtom, {
      [orderUid]: {
        progressBarStepName: OrderProgressBarStepName.UNFILLABLE,
        previousStepName: OrderProgressBarStepName.SOLVING,
        lastTimeChangedSteps: Date.now(),
      },
    })

    const { rerender, unmount } = render(<OrderProgressEventsUpdater />, { wrapper: TestComponent })

    useOnlyPendingOrdersMock.mockReturnValue([])

    rerender(<OrderProgressEventsUpdater />)

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(
      OrderProgressBarStepName.UNFILLABLE,
    )

    act(() => {
      jest.advanceTimersByTime(MINIMUM_STEP_DISPLAY_TIME - 1)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(
      OrderProgressBarStepName.UNFILLABLE,
    )

    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(store.get(ordersProgressBarStateAtom)[orderUid]?.progressBarStepName).toBe(OrderProgressBarStepName.SOLVING)

    unmount()
  })
})
