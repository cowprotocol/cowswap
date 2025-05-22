import { useMemo } from 'react'

import { SolverInfo } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Nullish } from 'types'

import { ApiSolverCompetition, SolverCompetition } from 'modules/orderProgressBarMixed/orderProgressBar'

import { useSolversInfo } from 'common/hooks/useSolversInfo'

export function useBridgeWinningSolverInfo(
  sourceChainId: SupportedChainId,
  winningSolverId: Nullish<string>,
): SolverCompetition | null {
  const allSolversInfo = useSolversInfo(sourceChainId)

  // This is a computation that depends on external data (solversInfo) that might change,
  // so we should memoize it to avoid unnecessary recalculations
  const winningSolverDisplayInfo = useMemo(() => {
    if (!winningSolverId || !allSolversInfo || !Object.keys(allSolversInfo).length) {
      return undefined
    }
    const normalizedId = winningSolverId.replace(/-solve$/, '')
    return allSolversInfo[normalizedId]
  }, [winningSolverId, allSolversInfo])

  // Given that this is a complex object being built that's used in a child component,
  // memoization makes sense to prevent unnecessary re-renderings
  return useMemo(() => {
    if (!winningSolverId) {
      return null
    }
    const baseSolverData: Pick<ApiSolverCompetition, 'solver'> = {
      solver: winningSolverId,
    }

    const displayInfo: Partial<SolverInfo> = winningSolverDisplayInfo || {}

    return {
      ...baseSolverData,
      ...displayInfo,
    } as SolverCompetition
  }, [winningSolverId, winningSolverDisplayInfo])
}
