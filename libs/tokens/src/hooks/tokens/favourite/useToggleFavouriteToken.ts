import { useSetAtom } from 'jotai'

import { toggleFavouriteTokenAtom } from '../../../state/tokens/favouriteTokensAtom'

export function useToggleFavouriteToken() {
  return useSetAtom(toggleFavouriteTokenAtom)
}
