import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { formatFiatAmount, formatTokenAmount } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@cowprotocol/currency'
import { getTokenAmountTitle } from '@cowprotocol/ui'

import { buildWaitAndSaveOutcome, formatGainFiat } from './buildWaitAndSaveOutcome.utils'
import {
  WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT,
  WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_USD,
} from './waitAndSaveOutcome.constants'

import type { PositiveAloneGain } from './deriveWaitAndSaveCompetition.utils'

const GAIN: PositiveAloneGain = {
  bestAloneBuyAmount: 1_000000n,
  gainAmount: 50_000n,
  gainPercent: 5,
  winningBuyAmount: 1_050000n,
}

function fiatTitles(
  token: typeof USDC_MAINNET,
  gainAmountRaw: bigint,
  fiatRaw: bigint,
): {
  priceImprovementTitle: string
  totalSavedTitle: string
  volumeFeeSavedTitle: string
} {
  const gainAmount = CurrencyAmount.fromRawAmount(token, gainAmountRaw.toString())
  const fiatAmount = CurrencyAmount.fromRawAmount(token, fiatRaw.toString())
  const feeFiat = CurrencyAmount.fromRawAmount(
    token,
    (
      BigInt(Math.round(WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_USD * 100)) *
      10n ** BigInt(Math.max(token.decimals - 2, 0))
    ).toString(),
  )
  const feeAmount = gainAmount.multiply(feeFiat).divide(fiatAmount)

  return {
    priceImprovementTitle: getTokenAmountTitle({ amount: gainAmount, tokenSymbol: token }),
    totalSavedTitle: getTokenAmountTitle({ amount: gainAmount.add(feeAmount), tokenSymbol: token }),
    volumeFeeSavedTitle: getTokenAmountTitle({ amount: feeAmount, tokenSymbol: token }),
  }
}

describe('formatGainFiat', () => {
  it('prefixes a formatted fiat amount', () => {
    const amount = CurrencyAmount.fromRawAmount(USDC_MAINNET, 4_500000n)

    expect(formatGainFiat(amount)).toBe(`$${formatFiatAmount(amount)}`)
  })

  it('uses the less-than prefix when a positive amount rounds below one cent', () => {
    expect(formatGainFiat(CurrencyAmount.fromRawAmount(USDC_MAINNET, 1n))).toBe('<$0.01')
  })

  it('returns an empty string when there is no fiat amount', () => {
    expect(formatGainFiat(null)).toBe('')
    expect(formatGainFiat(CurrencyAmount.fromRawAmount(USDC_MAINNET, 0n))).toBe('')
  })
})

describe('buildWaitAndSaveOutcome', () => {
  it('builds the comparison card with savings breakdown when fee waiver and comparison are both available', () => {
    const fiatRaw = 4_500000n
    const outcome = buildWaitAndSaveOutcome({
      buyToken: USDC_MAINNET,
      fiatAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, fiatRaw),
      gain: GAIN,
      volumeFeeSavedFiat: WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT,
    })
    const titles = fiatTitles(USDC_MAINNET, GAIN.gainAmount, fiatRaw)

    expect(outcome).toEqual({
      variant: 'withWaivedFeeAndCow',
      priceImprovement: `$${formatFiatAmount(CurrencyAmount.fromRawAmount(USDC_MAINNET, fiatRaw))}`,
      priceImprovementTitle: titles.priceImprovementTitle,
      totalSaved: `$${formatFiatAmount(CurrencyAmount.fromRawAmount(USDC_MAINNET, 4_800000n))}`,
      totalSavedTitle: titles.totalSavedTitle,
      volumeFeeSaved: WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT,
      volumeFeeSavedTitle: titles.volumeFeeSavedTitle,
    })
  })

  it('uses the token amount and symbol when fiat conversion is unavailable', () => {
    const outcome = buildWaitAndSaveOutcome({
      buyToken: WETH_MAINNET,
      fiatAmount: null,
      gain: GAIN,
      volumeFeeSavedFiat: WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT,
    })
    const tokenAmount = formatTokenAmount(CurrencyAmount.fromRawAmount(WETH_MAINNET, GAIN.gainAmount))

    expect(outcome).toEqual({
      variant: 'withWaivedFeeAndCow',
      priceImprovement: `${tokenAmount} WETH`,
      totalSaved: `${tokenAmount} WETH`,
      volumeFeeSaved: WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT,
    })
  })

  it('builds the large comparison card when only a gain is available', () => {
    const outcome = buildWaitAndSaveOutcome({
      buyToken: WETH_MAINNET,
      fiatAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, 1n),
      gain: {
        bestAloneBuyAmount: 0n,
        gainAmount: 1n,
        gainPercent: undefined,
        winningBuyAmount: 1n,
      },
    })

    expect(outcome).toEqual({
      variant: 'withCow',
      gainAmount: formatTokenAmount(CurrencyAmount.fromRawAmount(WETH_MAINNET, 1n)),
      tokenSymbol: 'WETH',
    })
  })

  it('builds the compact fee-waiver banner when only a waived fee is available', () => {
    const outcome = buildWaitAndSaveOutcome({
      buyToken: USDC_MAINNET,
      fiatAmount: null,
      gain: undefined,
      volumeFeeSavedFiat: WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT,
    })

    expect(outcome).toEqual({
      variant: 'withWaivedFee',
      volumeFeeSavedFiat: WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT,
    })
  })

  it('returns undefined when neither a gain nor a waived fee is available', () => {
    expect(
      buildWaitAndSaveOutcome({
        buyToken: USDC_MAINNET,
        fiatAmount: null,
        gain: undefined,
      }),
    ).toBeUndefined()
  })
})
