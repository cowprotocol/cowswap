import { useSetAtom } from 'jotai'
import { solversInfoAtom } from '../state'
import { useEffect } from 'react'
import { useCmsSolversInfo } from '../hooks'
import { mapCmsSolversInfoToSolversInfo } from '../utils'

export function SolversInfoUpdater() {
  const setSolversInfo = useSetAtom(solversInfoAtom)

  const cmsSolversInfo = useCmsSolversInfo()

  useEffect(() => {
    const solversInfo = mapCmsSolversInfoToSolversInfo(cmsSolversInfo)

    solversInfo && setSolversInfo(solversInfo)
  }, [cmsSolversInfo])

  return null
}
