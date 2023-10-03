import { useAtomValue } from 'jotai'
import { activeTokensAtom } from '../state/tokensAtom'
import { TokenWithLogo } from '../types'

export function useAllTokens(): TokenWithLogo[] {
  return useAtomValue(activeTokensAtom)
}
