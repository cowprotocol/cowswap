import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { multiCallContextAtom } from '../state/multiCallContextAtom'

interface MultiCallProviderProps {
  chainId: number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function MultiCallUpdater({ chainId }: MultiCallProviderProps) {
  const setContext = useSetAtom(multiCallContextAtom)

  useEffect(() => {
    setContext({ chainId })
  }, [chainId, setContext])

  return null
}
