import { useSetAtom } from 'jotai'
import { resetFavouriteTokensAtom, toggleFavouriteTokenAtom } from '../state/tokens/favouriteTokensAtom'

export function useToggleFavouriteToken() {
  return useSetAtom(toggleFavouriteTokenAtom)
}
