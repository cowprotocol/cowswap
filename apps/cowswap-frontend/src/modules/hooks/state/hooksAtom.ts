import { atom } from 'jotai'

import { PermitHookData } from '../types'

export const hooksAtom = atom<{ preHooks: PermitHookData[]; postHooks: PermitHookData[] }>({
  preHooks: [],
  postHooks: [],
})

// export const addHookAtom = atom(null, (get, set, nextState: PermitHookData[]) => {
//   set(hooksAtom, () => {
//     return nextState.filter
//   })
// })

// export const removeHookAtom = atom(null, (get, set, nextState: PermitHookData[]) => {
//   set(hooksAtom, () => {
//     return nextState.filter()
//   })
// })

// export const updateOrdersToCancelAtom = atom(null, (get, set, nextState: CancellableOrder[]) => {
//   set(ordersToCancelAtom, () => {
//     return nextState.filter(isOrderOffChainCancellable)
//   })
// })

// export const removeOrdersToCancelAtom = atom(null, (get, set, ordersUids: string[]) => {
//   set(ordersToCancelAtom, () => {
//     const state = get(ordersToCancelAtom)

//     return state.filter((item) => !ordersUids.includes(item.id))
//   })
// })
