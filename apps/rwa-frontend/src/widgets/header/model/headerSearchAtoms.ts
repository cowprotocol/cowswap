import { atomWithQuery } from 'jotai-tanstack-query'

import { assetsSearchQueryOptions } from '@/entities/asset'
import { debouncedTextAtoms } from '@/shared/lib/debounced-text'

const SEARCH_DEBOUNCE_MS = 300
const SEARCH_SUGGESTIONS_LIMIT = 5

export const {
  valueAtom: headerSearchQueryAtom,
  debouncedValueAtom: debouncedHeaderSearchQueryAtom,
  setValueAtom: setHeaderSearchQueryAtom,
} = debouncedTextAtoms(SEARCH_DEBOUNCE_MS)

export const headerSearchResultQueryAtom = atomWithQuery((get) =>
  assetsSearchQueryOptions(get(debouncedHeaderSearchQueryAtom), SEARCH_SUGGESTIONS_LIMIT),
)
