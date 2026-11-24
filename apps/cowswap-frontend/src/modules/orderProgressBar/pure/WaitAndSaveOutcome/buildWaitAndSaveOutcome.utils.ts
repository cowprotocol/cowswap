import { formatTokenAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { getTokenAmountTitle } from '@cowprotocol/ui'

import { formatPositiveFiat } from 'modules/trade'

import type { PositiveAloneGain } from './deriveWaitAndSaveCompetition.utils'
import type { WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.pure'

export interface WaitAndSaveVolumeFee {
  buyAmount: bigint
  fiatAmount: CurrencyAmount<Currency> | null
}

export function buildWaitAndSaveOutcome(params: {
  buyToken: Currency
  fiatAmount: CurrencyAmount<Currency> | null
  gain: PositiveAloneGain | undefined
  volumeFee?: WaitAndSaveVolumeFee
}): WaitAndSaveOutcomeProps | undefined {
  const { buyToken, fiatAmount, gain, volumeFee } = params
  const displayedFee = toDisplayedVolumeFee(buyToken, volumeFee)

  if (gain && displayedFee) {
    return buildWaivedFeeAndCowOutcome(buyToken, fiatAmount, gain, displayedFee, volumeFee?.fiatAmount ?? null)
  }

  if (gain) {
    return {
      variant: 'withCow',
      gainAmount: formatOutcomeAmount(buyToken, gain.gainAmount),
      tokenSymbol: buyToken.symbol ?? '',
    }
  }

  if (displayedFee) {
    return {
      variant: 'withWaivedFee',
      volumeFeeSavedFiat: displayedFee.fiat,
    }
  }

  return undefined
}

export function formatGainFiat(amount: CurrencyAmount<Currency> | null): string {
  return formatPositiveFiat(amount) ?? ''
}

export function formatTotalSavedFiat(
  priceImprovement: CurrencyAmount<Currency> | null,
  volumeFee: CurrencyAmount<Currency> | null,
): string {
  if (
    priceImprovement?.greaterThan(0) &&
    volumeFee?.greaterThan(0) &&
    priceImprovement.currency.equals(volumeFee.currency)
  ) {
    return formatGainFiat(priceImprovement.add(volumeFee))
  }

  if (priceImprovement?.greaterThan(0)) return formatGainFiat(priceImprovement)

  return formatGainFiat(volumeFee)
}

function buildFiatAmountTitles(
  buyToken: Currency,
  gainAmountRaw: bigint,
  feeBuyAmount: CurrencyAmount<Currency>,
):
  | {
      priceImprovementTitle: string
      totalSavedTitle: string
      volumeFeeSavedTitle: string
    }
  | undefined {
  if (gainAmountRaw <= 0n) return undefined

  const gainAmount = CurrencyAmount.fromRawAmount(buyToken, gainAmountRaw.toString())

  return {
    priceImprovementTitle: getTokenAmountTitle({ amount: gainAmount, tokenSymbol: buyToken }),
    totalSavedTitle: getTokenAmountTitle({ amount: gainAmount.add(feeBuyAmount), tokenSymbol: buyToken }),
    volumeFeeSavedTitle: getTokenAmountTitle({ amount: feeBuyAmount, tokenSymbol: buyToken }),
  }
}

function buildWaivedFeeAndCowOutcome(
  buyToken: Currency,
  fiatAmount: CurrencyAmount<Currency> | null,
  gain: PositiveAloneGain,
  displayedFee: { buyAmount: CurrencyAmount<Currency>; fiat: string },
  volumeFeeFiat: CurrencyAmount<Currency> | null,
): Extract<WaitAndSaveOutcomeProps, { variant: 'withWaivedFeeAndCow' }> {
  const gainAmount = formatOutcomeAmount(buyToken, gain.gainAmount)
  const tokenSymbol = buyToken.symbol ?? ''
  const priceImprovementFiat = formatGainFiat(fiatAmount)
  const priceImprovement = formatSavedAmount(priceImprovementFiat, gainAmount, tokenSymbol)
  const fiatTitles = priceImprovementFiat
    ? buildFiatAmountTitles(buyToken, gain.gainAmount, displayedFee.buyAmount)
    : undefined

  return {
    variant: 'withWaivedFeeAndCow',
    priceImprovement,
    priceImprovementTitle: fiatTitles?.priceImprovementTitle,
    totalSaved: priceImprovementFiat ? formatTotalSavedFiat(fiatAmount, volumeFeeFiat) : priceImprovement,
    totalSavedTitle: fiatTitles?.totalSavedTitle,
    volumeFeeSaved: displayedFee.fiat,
    volumeFeeSavedTitle: fiatTitles?.volumeFeeSavedTitle,
  }
}

function formatOutcomeAmount(token: Currency, rawAmount: bigint): string {
  return formatTokenAmount(CurrencyAmount.fromRawAmount(token, rawAmount.toString()))
}

function formatSavedAmount(fiatLabel: string, tokenAmount: string, tokenSymbol: string): string {
  if (fiatLabel) return fiatLabel

  return tokenSymbol ? `${tokenAmount} ${tokenSymbol}` : tokenAmount
}

function toDisplayedVolumeFee(
  buyToken: Currency,
  volumeFee: WaitAndSaveVolumeFee | undefined,
): { buyAmount: CurrencyAmount<Currency>; fiat: string } | undefined {
  if (!volumeFee || volumeFee.buyAmount <= 0n) return undefined

  const fiat = formatGainFiat(volumeFee.fiatAmount)
  if (!fiat) return undefined

  return {
    buyAmount: CurrencyAmount.fromRawAmount(buyToken, volumeFee.buyAmount.toString()),
    fiat,
  }
}
