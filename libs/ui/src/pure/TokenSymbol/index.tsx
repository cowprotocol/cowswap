import { Currency } from '@uniswap/sdk-core'

import { Nullish } from '../../types'
import { formatSymbol } from '@cowprotocol/common-utils'

export type TokenNameAndSymbol = Pick<Currency, 'symbol' | 'name'>

export type TokenSymbolProps = {
  token: Nullish<TokenNameAndSymbol>
  length?: number
  className?: string
}

function getAbbreviatedSymbol(props: Omit<TokenSymbolProps, 'className'>) {
  const { token, length } = props
  const { symbol, name } = token || {}

  if (!symbol && !name) return null

  const fullSymbol = symbol || name
  const abbreviateSymbol = formatSymbol(fullSymbol, length)
  const title = fullSymbol === abbreviateSymbol ? undefined : fullSymbol

  return {
    abbreviateSymbol,
    title,
  }
}

export function TokenSymbol(props: TokenSymbolProps) {
  const abbreviatedSymbol = getAbbreviatedSymbol(props)
  if (!abbreviatedSymbol) return null

  const { abbreviateSymbol, title } = abbreviatedSymbol

  return (
    <span className={props.className} title={title}>
      {abbreviateSymbol}
    </span>
  )
}

export function getSymbol(props: Omit<TokenSymbolProps, 'className'>): string | null {
  const aux = getAbbreviatedSymbol(props)
  if (!aux) return null

  return aux.abbreviateSymbol || null
}
