import { formatSymbol } from '@cow/utils/format'

export type Props = {
  token:
    | {
        symbol?: string | undefined
        name?: string | undefined
      }
    | undefined
  length?: number
}

export function TokenSymbol({ token, length }: Props) {
  const { symbol, name } = token || {}

  if (!symbol || !name) {
    return null
  }

  const fullSymbol = symbol || name
  const abbreviateSymbol = formatSymbol(fullSymbol, length)

  return <span title={fullSymbol}>{abbreviateSymbol}</span>
}
