import { useEffect, useState } from 'react'

import { fetchSolversInfo, SolversInfo } from 'utils/fetchSolversInfo'

type UseSolversInfo = {
  solversInfo: SolversInfo
  isLoading: boolean
  error: string | null
}

const EMPTY_SOLVERS_INFO: SolversInfo = []

export function useSolversInfo(network?: number): UseSolversInfo {
  const [solversInfo, setSolversInfo] = useState<SolversInfo>(EMPTY_SOLVERS_INFO)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isSubscribed = true

    setIsLoading(true)
    setError(null)

    fetchSolversInfo(network)
      .then((info) => {
        if (isSubscribed) {
          setSolversInfo(info)
        }
      })
      .catch((error: unknown) => {
        if (isSubscribed) {
          setError(error instanceof Error ? error.message : 'Failed to load solvers info')
          setSolversInfo(EMPTY_SOLVERS_INFO)
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoading(false)
        }
      })

    return () => {
      isSubscribed = false
    }
  }, [network])

  return { solversInfo, isLoading, error }
}
