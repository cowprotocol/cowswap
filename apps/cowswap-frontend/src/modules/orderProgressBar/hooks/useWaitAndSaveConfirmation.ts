import { useMemo } from 'react'

import type { SolverCompetitionResponse } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { parsePositiveBuyAmount } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { useSolversInfoByAddress } from 'common/hooks/useSolversInfoByAddress'
import type { SolverCompetition } from 'common/types/soverCompetition'

import { toDisplayedSolverCompetition } from './toDisplayedSolverCompetition.utils'
import {
  useWaitAndSaveSolverCompetition,
  type UseWaitAndSaveSolverCompetitionParams,
} from './useWaitAndSaveSolverCompetition'

import {
  buildWaitAndSaveOutcome,
  type WaitAndSaveVolumeFee,
} from '../pure/WaitAndSaveOutcome/buildWaitAndSaveOutcome.utils'
import {
  deriveWaitAndSaveCompetition,
  type WaitAndSaveCompetitionDerivation,
} from '../pure/WaitAndSaveOutcome/deriveWaitAndSaveCompetition.utils'
import { selectWaitAndSaveStrip, type WaitAndSaveStrip } from '../pure/WaitAndSaveOutcome/selectWaitAndSaveStrip.utils'

import type { WaitAndSaveOutcomeProps } from '../pure/WaitAndSaveOutcome/WaitAndSaveOutcome.pure'

export interface UseWaitAndSaveConfirmationParams extends UseWaitAndSaveSolverCompetitionParams {
  buyToken: Currency | undefined
  /** Raw buy-token atoms stored on the order at placement. */
  waivedFeeAmount?: string
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
  const { buyToken, chainId, enabled, orderUid, waivedFeeAmount } = params
  const { competition, pending } = useWaitAndSaveSolverCompetition({ chainId, enabled, orderUid })
  const solversInfoByAddress = useSolversInfoByAddress(chainId)
  const derivation = useMemo(() => deriveCompetition(competition, orderUid), [competition, orderUid])
  const waivedFeeRaw = parsePositiveBuyAmount(waivedFeeAmount)
  const gainAmount = useMemo(() => toGainAmount(buyToken, derivation?.positiveGain?.gainAmount), [buyToken, derivation])
  const waivedFeeBuyAmount = useMemo(() => toGainAmount(buyToken, waivedFeeRaw), [buyToken, waivedFeeRaw])
  const gainFiat = useUsdAmount(gainAmount).value
  const waivedFeeFiat = useUsdAmount(waivedFeeBuyAmount).value

  return useMemo(() => {
    if (!enabled || !orderUid) return IDLE_CONFIRMATION
    if (pending) return { ...IDLE_CONFIRMATION, pending: true }

    return toSettledConfirmation({
      buyToken,
      derivation,
      gainFiat,
      solversInfoByAddress,
      volumeFee: waivedFeeRaw === undefined ? undefined : { buyAmount: waivedFeeRaw, fiatAmount: waivedFeeFiat },
    })
  }, [buyToken, derivation, enabled, gainFiat, orderUid, pending, solversInfoByAddress, waivedFeeFiat, waivedFeeRaw])
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
  volumeFee: WaitAndSaveVolumeFee | undefined
}): WaitAndSaveConfirmation {
  const { buyToken, derivation, gainFiat, solversInfoByAddress, volumeFee } = params
  const displayedSolvers = derivation?.solvers.length
    ? toDisplayedSolverCompetition(derivation.solvers, solversInfoByAddress)
    : undefined
  const outcome = buyToken
    ? buildWaitAndSaveOutcome({
        buyToken,
        fiatAmount: gainFiat,
        gain: derivation?.positiveGain,
        volumeFee,
      })
    : undefined

  return {
    outcome,
    pending: false,
    solvers: displayedSolvers?.length ? displayedSolvers : undefined,
    strip: selectWaitAndSaveStrip(derivation),
  }
}
