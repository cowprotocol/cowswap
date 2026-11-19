import { formatFiatAmount, formatTokenAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

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
    const gainAmount = formatOutcomeAmount(buyToken, gain.gainAmount)
    const tokenSymbol = buyToken.symbol ?? ''
    const priceImprovement = formatSavedAmount(fiatAmount, gainAmount, tokenSymbol)

    return {
      variant: 'withWaivedFeeAndCow',
      priceImprovement,
      totalSaved: formatGainFiat(fiatAmount)
        ? formatTotalSavedFiat(fiatAmount, WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_USD)
        : priceImprovement,
      volumeFeeSaved: volumeFeeSavedFiat,
    }
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

function formatOutcomeAmount(token: Currency, rawAmount: bigint): string {
  return formatTokenAmount(CurrencyAmount.fromRawAmount(token, rawAmount.toString()))
}

function formatSavedAmount(
  fiatAmount: CurrencyAmount<Currency> | null,
  tokenAmount: string,
  tokenSymbol: string,
): string {
  const fiatLabel = formatGainFiat(fiatAmount)
  if (fiatLabel) return fiatLabel

  return tokenSymbol ? `${tokenAmount} ${tokenSymbol}` : tokenAmount
}

function usdToCurrencyAmount(currency: Currency, usd: number): CurrencyAmount<Currency> {
  const cents = BigInt(Math.round(usd * 100))
  const scale = 10n ** BigInt(Math.max(currency.decimals - 2, 0))

  return CurrencyAmount.fromRawAmount(currency, (cents * scale).toString())
}
