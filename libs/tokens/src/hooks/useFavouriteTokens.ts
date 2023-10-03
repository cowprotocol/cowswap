import { useAtomValue } from 'jotai'
import { TokenWithLogo } from '../types'
import { favouriteTokensListAtom } from '../state/favouriteTokensAtom'

export function useFavouriteTokens(): TokenWithLogo[] {
  return useAtomValue(favouriteTokensListAtom)
}
