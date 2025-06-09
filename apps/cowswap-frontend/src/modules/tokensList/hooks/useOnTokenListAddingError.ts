import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { tokenListAddingErrorAtom } from '../state/tokenListAddingErrorAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOnTokenListAddingError() {
  const setTokenListAddingError = useSetAtom(tokenListAddingErrorAtom)

  return useCallback(
    (error: Error) => {
      setTokenListAddingError(error.message)
    },
    [setTokenListAddingError]
  )
}
