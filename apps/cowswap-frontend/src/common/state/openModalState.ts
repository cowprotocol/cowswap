import { atom } from 'jotai'

/** Content elements of the legacy modals currently rendered, in the order they opened. */
export const openModalElementsState = atom<HTMLElement[]>([])

export const openModalState = atom((get) => get(openModalElementsState).length > 0)
