import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { solversInfoAtom } from '../state'
import { SolversInfo } from '../types'

export function useSolversInfo(chainId: SupportedChainId): SolversInfo {
  const allSolversInfo = useAtomValue(solversInfoAtom)

  return useMemo(() => allSolversInfo.filter((info) => info.chainIds.includes(chainId)), [chainId, allSolversInfo])
}
