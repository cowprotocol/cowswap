import { useAtomValue } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { favoriteTokensListAtom } from '../../../state/tokens/favoriteTokensAtom'

export function useFavoriteTokens(): TokenWithLogo[] {
  return useAtomValue(favoriteTokensListAtom)
}
