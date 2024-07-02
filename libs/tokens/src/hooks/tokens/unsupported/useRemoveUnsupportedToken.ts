import { useSetAtom } from 'jotai'

import { removeUnsupportedTokensAtom } from '../../../state/tokens/unsupportedTokensAtom'

export function useRemoveUnsupportedToken() {
  const removeUnsupportedToken = useSetAtom(removeUnsupportedTokensAtom)

  return (tokenAddress: string) => removeUnsupportedToken([tokenAddress])
}
