import BigNumber from 'bignumber.js'

const MIN_SHOWN_PERCENT = 0.01

export function formatSurplusPercent(surplusFraction: BigNumber): string {
  const percent = surplusFraction.multipliedBy(100)

  if (percent.gt(0) && percent.lt(MIN_SHOWN_PERCENT)) return `<${MIN_SHOWN_PERCENT}%`

  return `+${percent.toFixed(2)}%`
}
