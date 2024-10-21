import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'

const ONE = new Fraction(1)

export function calculateBpsFromFeeMultiplier(
  sellAmount: CurrencyAmount<Currency> | undefined,
  feeAmount: CurrencyAmount<Currency> | undefined,
  isSell: boolean | undefined,
  multiplierPercentage: number,
): number | undefined {
  if (!sellAmount || !feeAmount || isSell === undefined || !multiplierPercentage || multiplierPercentage <= 0) {
    return undefined
  }

  const feeMultiplierFactor = new Fraction(100 + multiplierPercentage, 100) // 50% more fee, applied to the whole value => 150% => 15/10 in fraction

  if (isSell) {
    // sell
    // 1 - ((sellAmount - feeAmount * 1.5) / (sellAmount - feeAmount))
    // 1 - (sellAmount - feeAmount * feeMultiplierFactor) / sellAmount - feeAmount
    return percentageToBps(
      ONE.subtract(
        sellAmount
          .subtract(feeAmount.multiply(feeMultiplierFactor))
          // !!! Need to convert to fraction before division to not lose precision
          .asFraction.divide(sellAmount.subtract(feeAmount).asFraction),
      ),
    )
  } else {
    // buy
    // (sellAmount + feeAmount * 1.5) / (sellAmount + feeAmount) - 1
    // ((sellAmount + feeAmount * feeMultiplierFactor) / (sellAmount - feeAmount)) - 1
    return percentageToBps(
      sellAmount
        .add(feeAmount.multiply(feeMultiplierFactor))
        // !!! Need to convert to fraction before division to not lose precision
        .asFraction.divide(sellAmount.add(feeAmount).asFraction)
        .subtract(ONE),
    )
  }
}

function percentageToBps(value: Fraction | undefined): number | undefined {
  const bps = value?.multiply(10_000).toFixed(0)

  return bps ? +bps : undefined
}
