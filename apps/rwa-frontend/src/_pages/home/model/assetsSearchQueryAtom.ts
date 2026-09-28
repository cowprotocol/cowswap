import { atom } from 'jotai'

const SEARCH_DEBOUNCE_MS = 300

const searchTimeoutAtom = atom<ReturnType<typeof setTimeout> | undefined>(undefined)

export const assetsSearchQueryAtom = atom('')

export const debouncedAssetsSearchQueryAtom = atom('')

export const setAssetsSearchQueryAtom = atom(null, (get, set, query: string) => {
  set(assetsSearchQueryAtom, query)
  clearTimeout(get(searchTimeoutAtom))
  set(
    searchTimeoutAtom,
    setTimeout(() => set(debouncedAssetsSearchQueryAtom, query.trim()), SEARCH_DEBOUNCE_MS),
  )
})
