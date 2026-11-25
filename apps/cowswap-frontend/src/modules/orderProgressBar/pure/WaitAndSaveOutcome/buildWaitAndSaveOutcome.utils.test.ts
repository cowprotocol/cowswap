import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { formatFiatAmount, formatTokenAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { getTokenAmountTitle } from '@cowprotocol/ui'

import { buildWaitAndSaveOutcome, formatGainFiat } from './buildWaitAndSaveOutcome.utils'

import type { PositiveAloneGain } from './deriveWaitAndSaveCompetition.utils'

const GAIN: PositiveAloneGain = {
  bestAloneBuyAmount: 1_000000n,
  gainAmount: 50_000n,
  gainPercent: 5,
  winningBuyAmount: 1_050000n,
}

const FEE_BUY_AMOUNT = 30_000n
const FEE_FIAT_RAW = 300_000n
const GAIN_FIAT_RAW = 4_500_000n

function fiatTitles(
  token: typeof USDC_MAINNET,
  gainAmountRaw: bigint,
  feeAmount: CurrencyAmount<Currency>,
): {
  priceImprovementTitle: string
  totalSavedTitle: string
  volumeFeeSavedTitle: string
} {
  const gainAmount = CurrencyAmount.fromRawAmount(token, gainAmountRaw.toString())

  return {
    priceImprovementTitle: getTokenAmountTitle({ amount: gainAmount, tokenSymbol: token }),
    totalSavedTitle: getTokenAmountTitle({ amount: gainAmount.add(feeAmount), tokenSymbol: token }),
    volumeFeeSavedTitle: getTokenAmountTitle({ amount: feeAmount, tokenSymbol: feeAmount.currency }),
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
  const feeFiat = CurrencyAmount.fromRawAmount(USDC_MAINNET, FEE_FIAT_RAW)
  const feeAmount = CurrencyAmount.fromRawAmount(USDC_MAINNET, FEE_BUY_AMOUNT)
  const volumeFee = { amount: feeAmount, fiatAmount: feeFiat }

  it('builds the comparison card from the quote delta, separate from the CoW gain', () => {
    const outcome = buildWaitAndSaveOutcome({
      buyToken: USDC_MAINNET,
      fiatAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, GAIN_FIAT_RAW),
      gain: GAIN,
      volumeFee,
    })
    const titles = fiatTitles(USDC_MAINNET, GAIN.gainAmount, feeAmount)

    expect(outcome).toEqual({
      variant: 'withWaivedFeeAndCow',
      priceImprovement: `$${formatFiatAmount(CurrencyAmount.fromRawAmount(USDC_MAINNET, GAIN_FIAT_RAW))}`,
      priceImprovementTitle: titles.priceImprovementTitle,
      totalSaved: `$${formatFiatAmount(CurrencyAmount.fromRawAmount(USDC_MAINNET, GAIN_FIAT_RAW + FEE_FIAT_RAW))}`,
      totalSavedTitle: titles.totalSavedTitle,
      volumeFeeSaved: formatGainFiat(feeFiat),
      volumeFeeSavedTitle: titles.volumeFeeSavedTitle,
    })
  })

  it('uses the token amount for the CoW gain when its fiat conversion is unavailable', () => {
    const outcome = buildWaitAndSaveOutcome({
      buyToken: WETH_MAINNET,
      fiatAmount: null,
      gain: GAIN,
      volumeFee,
    })
    const tokenAmount = formatTokenAmount(CurrencyAmount.fromRawAmount(WETH_MAINNET, GAIN.gainAmount))

    expect(outcome).toEqual({
      variant: 'withWaivedFeeAndCow',
      priceImprovement: `${tokenAmount} WETH`,
      totalSaved: `${tokenAmount} WETH`,
      volumeFeeSaved: formatGainFiat(feeFiat),
    })
  })

  it('builds the large comparison card when only a CoW gain is available', () => {
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

  it('builds the compact fee-waiver banner from a positive quote delta', () => {
    const outcome = buildWaitAndSaveOutcome({
      buyToken: USDC_MAINNET,
      fiatAmount: null,
      gain: undefined,
      volumeFee,
    })

    expect(outcome).toEqual({
      variant: 'withWaivedFee',
      volumeFeeSavedFiat: formatGainFiat(feeFiat),
    })
  })

  it('adds the surplus and the waived fee in USD when they are different tokens', () => {
    const sellFee = CurrencyAmount.fromRawAmount(WETH_MAINNET, FEE_BUY_AMOUNT)
    const gainFiat = CurrencyAmount.fromRawAmount(USDC_MAINNET, GAIN_FIAT_RAW)
    const outcome = buildWaitAndSaveOutcome({
      buyToken: USDC_MAINNET,
      fiatAmount: gainFiat,
      gain: GAIN,
      volumeFee: { amount: sellFee, fiatAmount: feeFiat },
    })

    expect(outcome).toMatchObject({
      variant: 'withWaivedFeeAndCow',
      priceImprovement: `$${formatFiatAmount(gainFiat)}`,
      priceImprovementTitle: getTokenAmountTitle({
        amount: CurrencyAmount.fromRawAmount(USDC_MAINNET, GAIN.gainAmount),
        tokenSymbol: USDC_MAINNET,
      }),
      totalSaved: `$${formatFiatAmount(CurrencyAmount.fromRawAmount(USDC_MAINNET, GAIN_FIAT_RAW + FEE_FIAT_RAW))}`,
      volumeFeeSaved: formatGainFiat(feeFiat),
      volumeFeeSavedTitle: getTokenAmountTitle({ amount: sellFee, tokenSymbol: WETH_MAINNET }),
    })
    expect(outcome && 'totalSavedTitle' in outcome ? outcome.totalSavedTitle : undefined).toBeUndefined()
  })

  it('omits the waived fee when the amount is not positive', () => {
    expect(
      buildWaitAndSaveOutcome({
        buyToken: USDC_MAINNET,
        fiatAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, GAIN_FIAT_RAW),
        gain: GAIN,
        volumeFee: { amount: CurrencyAmount.fromRawAmount(USDC_MAINNET, 0n), fiatAmount: feeFiat },
      }),
    ).toEqual({
      variant: 'withCow',
      gainAmount: formatTokenAmount(CurrencyAmount.fromRawAmount(USDC_MAINNET, GAIN.gainAmount)),
      tokenSymbol: 'USDC',
    })
  })

  it('returns undefined when neither a gain nor a positive waived fee is available', () => {
    expect(
      buildWaitAndSaveOutcome({
        buyToken: USDC_MAINNET,
        fiatAmount: null,
        gain: undefined,
      }),
    ).toBeUndefined()
    expect(
      buildWaitAndSaveOutcome({
        buyToken: USDC_MAINNET,
        fiatAmount: null,
        gain: undefined,
        volumeFee: { amount: feeAmount, fiatAmount: null },
      }),
    ).toBeUndefined()
  })
})
