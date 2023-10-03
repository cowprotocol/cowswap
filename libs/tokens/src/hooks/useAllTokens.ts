import { useAtomValue } from 'jotai'
import { tokensListAtom } from '../state/tokensAtom'
import { TokenWithLogo } from '../types'

export function useAllTokens(): TokenWithLogo[] {
  return useAtomValue(tokensListAtom)
}
