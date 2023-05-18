import { formatSymbol } from 'utils/format'
import { Currency } from '@uniswap/sdk-core'
import { Nullish } from 'types'

export type TokenSymbolProps = {
  token: Nullish<Pick<Currency, 'symbol' | 'name'>>
  length?: number
  className?: string
}

export function TokenSymbol({ token, length, className }: TokenSymbolProps) {
  const { symbol, name } = token || {}

  if (!symbol && !name) return null

  const fullSymbol = symbol || name
  const abbreviateSymbol = formatSymbol(fullSymbol, length)
  const title = fullSymbol === abbreviateSymbol ? undefined : fullSymbol

  return (
    <span className={className} title={title}>
      {abbreviateSymbol}
    </span>
  )
}
