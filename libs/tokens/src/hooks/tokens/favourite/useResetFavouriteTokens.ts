import { useSetAtom } from 'jotai'

import { resetFavouriteTokensAtom } from '../../../state/tokens/favouriteTokensAtom'

export function useResetFavouriteTokens() {
  return useSetAtom(resetFavouriteTokensAtom)
}
