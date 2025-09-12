import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { ReactNode } from 'react'

export type IconType = 'success' | 'alert' | 'custom'

export interface SnackbarItem {
  content: ReactNode
  id: string
  duration?: number
  icon?: IconType
  customIcon?: ReactNode
}

export const snackbarsAtom = atomWithReset<{ [key: string]: SnackbarItem }>({})

export const addSnackbarAtom = atom(null, (get, set, item: SnackbarItem) => {
  set(snackbarsAtom, { ...get(snackbarsAtom), [item.id]: item })
})

export const removeSnackbarAtom = atom(null, (get, set, id: string) => {
  const state = get(snackbarsAtom)

  delete state[id]

  set(snackbarsAtom, { ...state })
})
