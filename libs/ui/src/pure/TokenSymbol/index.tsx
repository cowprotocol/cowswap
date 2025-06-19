import { formatSymbol } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

export type TokenNameAndSymbol = Pick<Currency, 'symbol' | 'name'>

export type TokenSymbolProps = {
  token: Nullish<TokenNameAndSymbol>
  length?: number
  className?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

export function formatTokenSymbol(props: Omit<TokenSymbolProps, 'className'>): string | null {
  const abbreviatedSymbol = getAbbreviatedSymbol(props)
  if (!abbreviatedSymbol) return null

  return abbreviatedSymbol.abbreviateSymbol || null
}
