import { useAtomValue } from 'jotai'
import { favouriteTokensListAtom } from '../state/favouriteTokensAtom'
import { TokenWithLogo } from '@cowprotocol/common-const'

export function useFavouriteTokens(): TokenWithLogo[] {
  return useAtomValue(favouriteTokensListAtom)
}
