import { useSetAtom } from 'jotai'
import { resetFavouriteTokensAtom } from '../state/favouriteTokensAtom'

export function useResetFavouriteTokens() {
  return useSetAtom(resetFavouriteTokensAtom)
}
