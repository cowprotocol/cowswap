const ALMOST_HUNDRED = 99.99

export const percentIsAlmostHundred = (percent: number) => percent > ALMOST_HUNDRED && percent < 100

export interface PercentDisplayProps {
  percent: number
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
