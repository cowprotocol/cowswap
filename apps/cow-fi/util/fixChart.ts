import { PricePoint } from '@/components/Chart'

export function fixChart(prices: PricePoint[] | undefined | null) {
  if (!prices) return { prices: null, blanks: [] }

  const fixedChart: PricePoint[] = []
  const blanks: PricePoint[][] = []
  let lastValue: PricePoint | undefined = undefined
  for (let i = 0; i < prices.length; i++) {
    if (prices[i].value !== 0) {
      if (fixedChart.length === 0 && i !== 0) {
        blanks.push([{ ...prices[0], value: prices[i].value }, prices[i]])
      }
      lastValue = prices[i]
      fixedChart.push(prices[i])
    }
  }

  if (lastValue && lastValue !== prices[prices.length - 1]) {
    blanks.push([lastValue, { ...prices[prices.length - 1], value: lastValue.value }])
  }

  return { prices: fixedChart, blanks }
}
