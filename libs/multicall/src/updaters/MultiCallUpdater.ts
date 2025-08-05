import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { multiCallContextAtom } from '../state/multiCallContextAtom'

interface MultiCallProviderProps {
  chainId: number | undefined
}

export function MultiCallUpdater({ chainId }: MultiCallProviderProps): null {
  const setContext = useSetAtom(multiCallContextAtom)

  useEffect(() => {
    setContext(chainId ? { chainId } : null)
  }, [chainId, setContext])

  return null
}
