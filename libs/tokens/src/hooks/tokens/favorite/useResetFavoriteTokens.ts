import { useSetAtom } from 'jotai'

import { resetFavoriteTokensAtom } from '../../../state/tokens/favoriteTokensAtom'

export function useResetFavoriteTokens() {
  return useSetAtom(resetFavoriteTokensAtom)
}
