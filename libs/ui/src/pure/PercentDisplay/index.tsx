import BigNumber from 'bignumber.js'

const ALMOST_HUNDRED = BigNumber(99.99)

export function percentIsAlmostHundred(percent: string) {
  const p = BigNumber(percent)

  return p.gt(ALMOST_HUNDRED) && p.lt(100)
}

export interface PercentDisplayProps {
  percent: string
}

export function PercentDisplay({ percent }: PercentDisplayProps) {
  if (percentIsAlmostHundred(percent)) {
    return <span>{'>'}99.99%</span>
  }

  const [integer, numeral] = percent.toString().split('.')

  return (
    <span>
      {integer}
      {numeral ? `.${numeral.slice(0, 2)}` : ''}%
    </span>
  )
}
