import { formatFiatAmount, formatTokenAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { getTokenAmountTitle } from '@cowprotocol/ui'

import { WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_USD } from './waitAndSaveOutcome.constants'

import type { PositiveAloneGain } from './deriveWaitAndSaveCompetition.utils'
import type { WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.pure'

export function buildWaitAndSaveOutcome(params: {
  buyToken: Currency
  fiatAmount: CurrencyAmount<Currency> | null
  gain: PositiveAloneGain | undefined
  volumeFeeSavedFiat?: string
}): WaitAndSaveOutcomeProps | undefined {
  const { buyToken, fiatAmount, gain, volumeFeeSavedFiat } = params

  if (gain && volumeFeeSavedFiat) {
    return buildWaivedFeeAndCowOutcome(buyToken, fiatAmount, gain, volumeFeeSavedFiat)
  }

  if (gain) {
    return {
      variant: 'withCow',
      gainAmount: formatOutcomeAmount(buyToken, gain.gainAmount),
      tokenSymbol: buyToken.symbol ?? '',
    }
  }

  if (volumeFeeSavedFiat) {
    return {
      variant: 'withWaivedFee',
      volumeFeeSavedFiat,
    }
  }

  return undefined
}

export function formatGainFiat(amount: CurrencyAmount<Currency> | null): string {
  if (!amount || !amount.greaterThan(0)) return ''

  const centScale = Math.max(amount.currency.decimals - 2, 0)
  const oneCent = CurrencyAmount.fromRawAmount(amount.currency, (10n ** BigInt(centScale)).toString())
  if (amount.lessThan(oneCent)) return '<$0.01'

  const formatted = formatFiatAmount(amount)
  return formatted ? `$${formatted}` : ''
}

export function formatTotalSavedFiat(
  priceImprovement: CurrencyAmount<Currency> | null,
  volumeFeeSavedUsd: number,
): string {
  if (!priceImprovement || !priceImprovement.greaterThan(0)) {
    return volumeFeeSavedUsd > 0 ? `$${volumeFeeSavedUsd.toFixed(2)}` : ''
  }

  if (volumeFeeSavedUsd <= 0) {
    return formatGainFiat(priceImprovement)
  }

  const feeAmount = usdToCurrencyAmount(priceImprovement.currency, volumeFeeSavedUsd)
  return formatGainFiat(priceImprovement.add(feeAmount))
}

function buildFiatAmountTitles(
  buyToken: Currency,
  gainAmountRaw: bigint,
  fiatAmount: CurrencyAmount<Currency> | null,
  volumeFeeSavedUsd: number,
):
  | {
      priceImprovementTitle: string
      totalSavedTitle: string
      volumeFeeSavedTitle: string | undefined
    }
  | undefined {
  if (!fiatAmount || !fiatAmount.greaterThan(0) || gainAmountRaw <= 0n) return undefined

  const gainAmount = CurrencyAmount.fromRawAmount(buyToken, gainAmountRaw.toString())
  const priceImprovementTitle = getTokenAmountTitle({ amount: gainAmount, tokenSymbol: buyToken })
  const feeAmount = toBuyTokenAmountFromUsd(gainAmount, fiatAmount, volumeFeeSavedUsd)
  const totalSavedTitle = getTokenAmountTitle({
    amount: feeAmount ? gainAmount.add(feeAmount) : gainAmount,
    tokenSymbol: buyToken,
  })

  return {
    priceImprovementTitle,
    totalSavedTitle,
    volumeFeeSavedTitle: feeAmount ? getTokenAmountTitle({ amount: feeAmount, tokenSymbol: buyToken }) : undefined,
  }
}

function buildWaivedFeeAndCowOutcome(
  buyToken: Currency,
  fiatAmount: CurrencyAmount<Currency> | null,
  gain: PositiveAloneGain,
  volumeFeeSavedFiat: string,
): Extract<WaitAndSaveOutcomeProps, { variant: 'withWaivedFeeAndCow' }> {
  const gainAmount = formatOutcomeAmount(buyToken, gain.gainAmount)
  const tokenSymbol = buyToken.symbol ?? ''
  const priceImprovementFiat = formatGainFiat(fiatAmount)
  const priceImprovement = formatSavedAmount(priceImprovementFiat, gainAmount, tokenSymbol)
  const fiatTitles = priceImprovementFiat
    ? buildFiatAmountTitles(buyToken, gain.gainAmount, fiatAmount, WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_USD)
    : undefined

  return {
    variant: 'withWaivedFeeAndCow',
    priceImprovement,
    priceImprovementTitle: fiatTitles?.priceImprovementTitle,
    totalSaved: priceImprovementFiat
      ? formatTotalSavedFiat(fiatAmount, WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_USD)
      : priceImprovement,
    totalSavedTitle: fiatTitles?.totalSavedTitle,
    volumeFeeSaved: volumeFeeSavedFiat,
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

function toBuyTokenAmountFromUsd(
  gainAmount: CurrencyAmount<Currency>,
  fiatAmount: CurrencyAmount<Currency>,
  usd: number,
): CurrencyAmount<Currency> | undefined {
  if (usd <= 0 || !fiatAmount.greaterThan(0)) return undefined

  return gainAmount.multiply(usdToCurrencyAmount(fiatAmount.currency, usd)).divide(fiatAmount)
}

function usdToCurrencyAmount(currency: Currency, usd: number): CurrencyAmount<Currency> {
  const cents = BigInt(Math.round(usd * 100))
  const scale = 10n ** BigInt(Math.max(currency.decimals - 2, 0))

  return CurrencyAmount.fromRawAmount(currency, (cents * scale).toString())
}
