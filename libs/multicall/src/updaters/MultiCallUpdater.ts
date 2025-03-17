import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { multiCallContextAtom } from '../state/multiCallContextAtom'

interface MultiCallProviderProps {
  chainId: number
}

export function MultiCallUpdater({ chainId }: MultiCallProviderProps) {
  const setContext = useSetAtom(multiCallContextAtom)

  useEffect(() => {
    setContext({ chainId })
  }, [chainId, setContext])

  return null
}
