import { useSetAtom } from 'jotai'

import { toggleFavoriteTokenAtom } from '../../../state/tokens/favoriteTokensAtom'

export function useToggleFavoriteToken() {
  return useSetAtom(toggleFavoriteTokenAtom)
}
