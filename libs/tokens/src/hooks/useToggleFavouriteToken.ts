import { useSetAtom } from 'jotai'
import { resetFavouriteTokensAtom, toggleFavouriteTokenAtom } from '../state/favouriteTokensAtom'

export function useToggleFavouriteToken() {
  return useSetAtom(toggleFavouriteTokenAtom)
}
