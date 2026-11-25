import BigNumber from 'bignumber.js'

const MIN_SHOWN_PERCENT = 0.01

/** For a positive surplus only: its fraction may round down to zero, which still reads as <0.01%. */
export function formatSurplusPercent(surplusFraction: BigNumber): string {
  const percent = surplusFraction.multipliedBy(100)

  if (percent.lt(MIN_SHOWN_PERCENT)) return `<${MIN_SHOWN_PERCENT}%`

  return `+${percent.toFixed(2)}%`
}
