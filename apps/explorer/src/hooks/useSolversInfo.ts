import { useEffect, useMemo, useState } from 'react'

import { fetchSolversInfo, SolversInfo } from 'utils/fetchSolversInfo'

export type UseSolversInfoResult = {
  solversInfo: SolversInfo
  isLoading: boolean
  error: string | null
}

const EMPTY_SOLVERS_INFO: SolversInfo = []

export function useSolversInfo(network?: number): UseSolversInfoResult {
  const [solversInfo, setSolversInfo] = useState<SolversInfo>(EMPTY_SOLVERS_INFO)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const isSubscribedRef = { current: true }

    setIsLoading(true)
    setError(null)

    fetchSolversInfo(network)
      .then((info) => {
        if (isSubscribedRef.current) {
          setSolversInfo(info)
        }
      })
      .catch((error: unknown) => {
        if (isSubscribedRef.current) {
          setError(error instanceof Error ? error.message : 'Failed to load solvers info')
          setSolversInfo(EMPTY_SOLVERS_INFO)
        }
      })
      .finally(() => {
        if (isSubscribedRef.current) {
          setIsLoading(false)
        }
      })

    return () => {
      isSubscribedRef.current = false
    }
  }, [network])

  return useMemo(
    () => ({
      solversInfo,
      isLoading,
      error,
    }),
    [error, isLoading, solversInfo],
  )
}
