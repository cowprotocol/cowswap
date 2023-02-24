import { atom } from 'jotai'

export const limitOrdersPaginationAtom = atom<{ pageNumber: number }>({ pageNumber: 1 })
