import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

export const readNotificationsAtom = atomWithStorage<number[]>(
  'readNotificationsAtom:v0',
  [],
  getJotaiIsolatedStorage(),
)

export const markNotificationsAsReadAtom = atom(null, (get, set, ids: number[]) => {
  const state = get(readNotificationsAtom)

  state.push(...ids.filter((id) => !state.includes(id)))

  set(readNotificationsAtom, state)
})

export const markNotificationsAsReadCloneArrayAtom = atom(null, (get, set, ids: number[]) => {
  const state = new Set(get(readNotificationsAtom))

  ids.forEach((id) => state.add(id))

  set(readNotificationsAtom, [...state])
})
