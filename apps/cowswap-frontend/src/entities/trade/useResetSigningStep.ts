import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { signingStepAtom } from './signingStepAtom'

export function useResetSigningStep(): () => void {
  const setState = useSetAtom(signingStepAtom)

  return useCallback(() => {
    setState(null)
  }, [setState])
}
