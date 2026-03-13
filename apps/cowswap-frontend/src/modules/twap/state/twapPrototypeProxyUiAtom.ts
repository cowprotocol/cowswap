import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

interface TwapPrototypeCancellationNoticeState {
  orderIds: string[]
}

const defaultCancellationNoticeState: TwapPrototypeCancellationNoticeState = {
  orderIds: [],
}

export const twapPrototypeCancellationNoticeAtom =
  atomWithReset<TwapPrototypeCancellationNoticeState>(defaultCancellationNoticeState)

export const queueTwapPrototypeCancellationNoticeAtom = atom(null, (get, set, orderIds: string[]) => {
  const prevState = get(twapPrototypeCancellationNoticeAtom)
  const nextOrderIds = Array.from(new Set(prevState.orderIds.concat(orderIds)))

  set(twapPrototypeCancellationNoticeAtom, { orderIds: nextOrderIds })
})

export const dismissTwapPrototypeCancellationNoticeAtom = atom(null, (_get, set) => {
  set(twapPrototypeCancellationNoticeAtom, defaultCancellationNoticeState)
})
