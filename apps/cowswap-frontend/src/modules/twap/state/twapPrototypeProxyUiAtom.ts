import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

interface TwapPrototypeCancellationNoticeState {
  orderIds: string[]
}

interface TwapPrototypeRecoverNoticeState {
  activeOrderCount: number
}

const defaultCancellationNoticeState: TwapPrototypeCancellationNoticeState = {
  orderIds: [],
}

const defaultRecoverNoticeState: TwapPrototypeRecoverNoticeState = {
  activeOrderCount: 0,
}

export const twapPrototypeCancellationNoticeAtom =
  atomWithReset<TwapPrototypeCancellationNoticeState>(defaultCancellationNoticeState)

export const twapPrototypeRecoverNoticeAtom = atomWithReset<TwapPrototypeRecoverNoticeState>(defaultRecoverNoticeState)

export const queueTwapPrototypeCancellationNoticeAtom = atom(null, (get, set, orderIds: string[]) => {
  const prevState = get(twapPrototypeCancellationNoticeAtom)
  const nextOrderIds = Array.from(new Set(prevState.orderIds.concat(orderIds)))

  set(twapPrototypeCancellationNoticeAtom, { orderIds: nextOrderIds })
})

export const dismissTwapPrototypeCancellationNoticeAtom = atom(null, (_get, set) => {
  set(twapPrototypeCancellationNoticeAtom, defaultCancellationNoticeState)
})

export const queueTwapPrototypeRecoverNoticeAtom = atom(null, (_get, set, activeOrderCount: number) => {
  set(twapPrototypeRecoverNoticeAtom, { activeOrderCount })
})

export const dismissTwapPrototypeRecoverNoticeAtom = atom(null, (_get, set) => {
  set(twapPrototypeRecoverNoticeAtom, defaultRecoverNoticeState)
})
