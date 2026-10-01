import { createStore, PrimitiveAtom, Provider } from 'jotai'
import { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'
import { eoaTwapOrdersAtom, TwapOrdersList } from 'entities/twap'

import { useEoaTwapDismissOnFinalStatus } from './useEoaTwapDismissOnFinalStatus'

import { TWAP_FINAL_STATUSES } from '../const'
import { EoaTwapSigningPhase, EoaTwapSigningSteps, eoaTwapSigningStepAtom } from '../state/eoaTwapSigningStepAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'

jest.mock('entities/twap', () => ({
  eoaTwapOrdersAtom: jest.requireActual('jotai').atom({}),
}))

const writableEoaTwapOrdersAtom = eoaTwapOrdersAtom as unknown as PrimitiveAtom<TwapOrdersList>

const EVENT_ID = 'event-1'
const NOW_MS = 1_800_000_000_000
const PART_DURATION_S = 60
const NUM_OF_PARTS = 2

function makeOrder(id: string, status: TwapOrderStatus, t0 = NOW_MS / 1000): TwapOrderItem {
  return {
    id,
    chainId: 1,
    safeAddress: '0x3333333333333333333333333333333333333333',
    status,
    submissionDate: new Date(NOW_MS).toISOString(),
    order: {
      sellToken: '0x4444444444444444444444444444444444444444',
      buyToken: '0x5555555555555555555555555555555555555555',
      receiver: '0x3333333333333333333333333333333333333333',
      partSellAmount: '1',
      minPartLimit: '1',
      t0,
      n: NUM_OF_PARTS,
      t: PART_DURATION_S,
      span: 0,
      appData: `0x${'00'.repeat(32)}`,
    },
    executionInfo: {
      confirmedPartsCount: 0,
      info: { executedSellAmount: '0', executedBuyAmount: '0', executedFeeAmount: '0' },
    },
  }
}

function setup(params: { step?: EoaTwapSigningSteps; eventId?: string; order?: TwapOrderItem }): {
  store: ReturnType<typeof createStore>
  onDismiss: jest.Mock
} {
  const { step = EoaTwapSigningSteps.Success, eventId = EVENT_ID, order } = params
  const store = createStore()
  const onDismiss = jest.fn()

  store.set(eoaTwapSigningStepAtom, {
    step,
    phase: EoaTwapSigningPhase.Confirmed,
    plan: [],
    lockDismiss: false,
    eventId,
  })
  store.set(writableEoaTwapOrdersAtom, order ? { [order.id]: order } : {})

  renderHook(() => useEoaTwapDismissOnFinalStatus(onDismiss), {
    wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
  })

  return { store, onDismiss }
}

describe('useEoaTwapDismissOnFinalStatus()', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(NOW_MS)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it.each(TWAP_FINAL_STATUSES)('dismisses the success state when the order becomes %s', (status) => {
    const { store, onDismiss } = setup({ order: makeOrder(EVENT_ID, TwapOrderStatus.Pending) })

    expect(onDismiss).not.toHaveBeenCalled()

    act(() => {
      store.set(writableEoaTwapOrdersAtom, { [EVENT_ID]: makeOrder(EVENT_ID, status) })
    })

    expect(onDismiss).toHaveBeenCalled()
  })

  it.each([TwapOrderStatus.Pending, TwapOrderStatus.Cancelling])('keeps the success state for %s orders', (status) => {
    const { onDismiss } = setup({ order: makeOrder(EVENT_ID, status) })

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('dismisses at the scheduled end time when the order status is never refreshed', () => {
    const { onDismiss } = setup({ order: makeOrder(EVENT_ID, TwapOrderStatus.Pending) })

    act(() => {
      jest.advanceTimersByTime(PART_DURATION_S * NUM_OF_PARTS * 1000 - 1)
    })
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('dismisses immediately when the scheduled end time has already passed', () => {
    const { onDismiss } = setup({ order: makeOrder(EVENT_ID, TwapOrderStatus.Pending, NOW_MS / 1000 - 1000) })

    act(() => {
      jest.advanceTimersByTime(0)
    })

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('ignores a finalized order that is not the one shown in the success state', () => {
    const { onDismiss } = setup({ order: makeOrder('event-other', TwapOrderStatus.Fulfilled) })

    act(() => {
      jest.runOnlyPendingTimers()
    })

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does nothing outside of the success state', () => {
    const { onDismiss } = setup({
      step: EoaTwapSigningSteps.SubmitTwap,
      order: makeOrder(EVENT_ID, TwapOrderStatus.Fulfilled),
    })

    act(() => {
      jest.runOnlyPendingTimers()
    })

    expect(onDismiss).not.toHaveBeenCalled()
  })
})
