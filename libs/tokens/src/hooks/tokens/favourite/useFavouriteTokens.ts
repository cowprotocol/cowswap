import { useAtomValue } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { favouriteTokensListAtom } from '../../../state/tokens/favouriteTokensAtom'

export function useFavouriteTokens(): TokenWithLogo[] {
  return useAtomValue(favouriteTokensListAtom)
}
