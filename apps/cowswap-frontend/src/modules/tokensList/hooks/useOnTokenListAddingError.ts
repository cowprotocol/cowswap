import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { tokenListAddingErrorAtom } from '../state/tokenListAddingErrorAtom'

export function useOnTokenListAddingError() {
  const setTokenListAddingError = useSetAtom(tokenListAddingErrorAtom)

  return useCallback(
    (error: Error) => {
      setTokenListAddingError(error.message)
    },
    [setTokenListAddingError]
  )
}
