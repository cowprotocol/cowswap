import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { solversInfoAtom, mapCmsSolversInfoToSolversInfo } from '@cowprotocol/core'

import { useCmsSolversInfo } from 'common/hooks/useCmsSolversInfo'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SolversInfoUpdater() {
  const setSolversInfo = useSetAtom(solversInfoAtom)

  const cmsSolversInfo = useCmsSolversInfo()

  useEffect(() => {
    const solversInfo = mapCmsSolversInfoToSolversInfo(cmsSolversInfo)

    solversInfo && setSolversInfo(solversInfo)
  }, [cmsSolversInfo, setSolversInfo])

  return null
}
