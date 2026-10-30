import { useMemo } from 'react'

import type { SolverCompetitionResponse } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { useUsdAmount } from 'modules/usdAmount'

import { useSolversInfoByAddress } from 'common/hooks/useSolversInfoByAddress'
import type { SolverCompetition } from 'common/types/soverCompetition'

import { toDisplayedSolverCompetition } from './toDisplayedSolverCompetition.utils'
import {
  useWaitAndSaveSolverCompetition,
  type UseWaitAndSaveSolverCompetitionParams,
} from './useWaitAndSaveSolverCompetition'

import { buildWaitAndSaveOutcome } from '../pure/WaitAndSaveOutcome/buildWaitAndSaveOutcome.utils'
import {
  deriveWaitAndSaveCompetition,
  type WaitAndSaveCompetitionDerivation,
} from '../pure/WaitAndSaveOutcome/deriveWaitAndSaveCompetition.utils'
import { selectWaitAndSaveStrip, type WaitAndSaveStrip } from '../pure/WaitAndSaveOutcome/selectWaitAndSaveStrip.utils'

import type { WaitAndSaveOutcomeProps } from '../pure/WaitAndSaveOutcome/WaitAndSaveOutcome.pure'

export interface UseWaitAndSaveConfirmationParams extends UseWaitAndSaveSolverCompetitionParams {
  buyToken: Currency | undefined
}

export interface WaitAndSaveConfirmation {
  outcome: WaitAndSaveOutcomeProps | undefined
  pending: boolean
  solvers: SolverCompetition[] | undefined
  strip: WaitAndSaveStrip | undefined
}

const IDLE_CONFIRMATION: WaitAndSaveConfirmation = {
  outcome: undefined,
  pending: false,
  solvers: undefined,
  strip: undefined,
}

export function useWaitAndSaveConfirmation(params: UseWaitAndSaveConfirmationParams): WaitAndSaveConfirmation {
  const { buyToken, chainId, enabled, orderUid } = params
  const { competition, pending } = useWaitAndSaveSolverCompetition({ chainId, enabled, orderUid })
  const solversInfoByAddress = useSolversInfoByAddress(chainId)
  const derivation = useMemo(() => deriveCompetition(competition, orderUid), [competition, orderUid])
  const gainAmount = useMemo(() => toGainAmount(buyToken, derivation?.positiveGain?.gainAmount), [buyToken, derivation])
  const gainFiat = useUsdAmount(gainAmount).value

  return useMemo(() => {
    if (!enabled || !orderUid) return IDLE_CONFIRMATION
    if (pending) return { ...IDLE_CONFIRMATION, pending: true }

    return toSettledConfirmation({ buyToken, derivation, gainFiat, solversInfoByAddress })
  }, [buyToken, derivation, enabled, gainFiat, orderUid, pending, solversInfoByAddress])
}

function deriveCompetition(
  competition: SolverCompetitionResponse | undefined,
  orderUid: string | undefined,
): WaitAndSaveCompetitionDerivation | undefined {
  if (!competition || !orderUid) return undefined

  return deriveWaitAndSaveCompetition(competition.solutions, orderUid)
}

function toGainAmount(
  buyToken: Currency | undefined,
  rawAmount: bigint | undefined,
): CurrencyAmount<Currency> | undefined {
  if (!buyToken || rawAmount === undefined) return undefined

  return CurrencyAmount.fromRawAmount(buyToken, rawAmount.toString())
}

function toSettledConfirmation(params: {
  buyToken: Currency | undefined
  derivation: WaitAndSaveCompetitionDerivation | undefined
  gainFiat: CurrencyAmount<Currency> | null
  solversInfoByAddress: Parameters<typeof toDisplayedSolverCompetition>[1]
}): WaitAndSaveConfirmation {
  const { buyToken, derivation, gainFiat, solversInfoByAddress } = params
  const displayedSolvers = derivation?.solvers.length
    ? toDisplayedSolverCompetition(derivation.solvers, solversInfoByAddress)
    : undefined

  return {
    outcome:
      buyToken && derivation?.positiveGain
        ? buildWaitAndSaveOutcome({ buyToken, fiatAmount: gainFiat, gain: derivation.positiveGain })
        : undefined,
    pending: false,
    solvers: displayedSolvers?.length ? displayedSolvers : undefined,
    strip: selectWaitAndSaveStrip(derivation),
  }
}
