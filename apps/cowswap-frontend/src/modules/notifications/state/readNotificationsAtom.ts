import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

type Account = string

type ReadNotificationsState = Record<Account, number[]>

export const readNotificationsAtom = atomWithStorage<ReadNotificationsState>(
  'readNotificationsAtom:v0',
  {},
  getJotaiIsolatedStorage()
)

export const markNotificationsAsReadAtom = atom(null, (get, set, account: string, ids: number[]) => {
  const state = get(readNotificationsAtom)

  const accountState = state[account] || []

  accountState.push(...ids.filter((id) => !accountState.includes(id)))

  set(readNotificationsAtom, {
    ...state,
    [account]: accountState,
  })
})
