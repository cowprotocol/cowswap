import { fetchSolversInfo, SolversInfo } from 'utils/fetchSolversInfo'
import { useEffect, useState } from 'react'

export function useSolversInfo(network?: number): SolversInfo {
  const [info, setInfo] = useState<SolversInfo>([])

  useEffect(() => {
    if (network) {
      fetchSolversInfo(network).then(setInfo)
    } else {
      setInfo([])
    }
  }, [network])

  return info
}
