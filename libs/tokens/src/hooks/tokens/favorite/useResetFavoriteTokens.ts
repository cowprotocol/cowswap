import { useSetAtom } from 'jotai'

import { resetFavoriteTokensAtom } from '../../../state/tokens/favoriteTokensAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useResetFavoriteTokens() {
  return useSetAtom(resetFavoriteTokensAtom)
}
