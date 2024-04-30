import { useEffect, useState } from 'react'

import { fetchSolversInfo, SolversInfo } from 'utils/fetchSolversInfo'

// TODO: Don't delete the hook it will be used in the feature
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
