/* eslint-disable no-restricted-imports */ // TODO: Don't use 'modules' import
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@uniswap/sdk-core'

import type { Order } from 'legacy/state/orders/actions'

import type { SwapResultContext } from 'modules/bridge/types'
import { useUsdAmount } from 'modules/usdAmount'

import { useGetExecutedBridgeSummary } from './useGetExecutedBridgeSummary'
import { useSafeMemo } from './useSafeMemo'

import type { SolverCompetition } from '../types/soverCompetition'

export function useSwapResultsContext(
  order: Order | undefined,
  winningSolver: SolverCompetition | undefined,
  intermediateToken: TokenWithLogo | undefined,
): SwapResultContext | undefined {
  const executedSummary = useGetExecutedBridgeSummary(order)

  const { swappedAmountWithFee, surplusAmount } = executedSummary || {}

  /**
   * We should use source chain currency as intermediateToken
   */
  const receivedAmount = useMemo(() => {
    if (!intermediateToken || !swappedAmountWithFee) return undefined

    return CurrencyAmount.fromRawAmount(intermediateToken, swappedAmountWithFee.toFixed(0))
  }, [swappedAmountWithFee, intermediateToken])

  const receivedAmountUsd = useUsdAmount(receivedAmount).value
  const surplusAmountUsd = useUsdAmount(surplusAmount).value

  return useSafeMemo(() => {
    if (!receivedAmount || !intermediateToken || receivedAmount.equalTo(0) || !surplusAmount) return undefined

    return {
      winningSolver,
      receivedAmount,
      surplusAmount,
      intermediateToken,
      surplusAmountUsd,
      receivedAmountUsd,
    }
  }, [winningSolver, receivedAmount, surplusAmount, intermediateToken, surplusAmountUsd, receivedAmountUsd])
}
