import { useMemo } from 'react'

import { Currency } from '@cowprotocol/currency'
import { useIsAnyOfTokensRWA } from '@cowprotocol/tokens'

import { TradeQuoteState } from 'modules/tradeQuote'

import { isValidQuoteError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

export function useTokenCustomTradeError(
  inputCurrency: Currency | undefined | null,
  outputCurrent: Currency | undefined | null,
  error: TradeQuoteState['error'],
): string | undefined {
  const isWeekendDay = isWeekend()
  const inputToken = isWeekendDay && inputCurrency?.isToken ? inputCurrency : undefined
  const outputToken = isWeekendDay && outputCurrent?.isToken ? outputCurrent : undefined
  const rwaToken = useIsAnyOfTokensRWA(inputToken, outputToken)

  return useMemo(() => {
    if (!isWeekendDay) return undefined
    if (!rwaToken) return undefined
    if (!isValidQuoteError(error)) return undefined
    if (error.type !== QuoteApiErrorCodes.InsufficientLiquidity) return undefined

    return `${rwaToken.symbol} not tradable until Sunday 23:59 UTC`
  }, [isWeekendDay, error, rwaToken])
}

function isWeekend(): boolean {
  const now = new Date()
  const utcDay = now.getUTCDay()

  // 0 - Sunday, 6 - Saturday
  return utcDay === 0 || utcDay === 6
}
