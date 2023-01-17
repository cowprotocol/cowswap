import { formatSymbol } from '@cow/utils/format'
import { Currency } from '@uniswap/sdk-core'

export type Props = {
  token: Pick<Currency, 'symbol' | 'name'> | undefined | null
  length?: number
  maxLength?: number
}

export function TokenSymbol({ token, length, maxLength }: Props) {
  const { symbol, name } = token || {}

  if (!symbol && !name) return null

  const fullSymbol = symbol || name
  const abbreviateSymbol = formatSymbol(fullSymbol, length, maxLength)

  return <span title={fullSymbol}>{abbreviateSymbol}</span>
}
