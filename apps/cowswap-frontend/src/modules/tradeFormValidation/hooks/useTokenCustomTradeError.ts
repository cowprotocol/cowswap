import { useMemo } from 'react'

import { useIsAnyOfTokensOndo } from '@cowprotocol/tokens'
import { Currency } from '@uniswap/sdk-core'

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
  const ondoToken = useIsAnyOfTokensOndo(inputToken, outputToken)

  return useMemo(() => {
    if (!isWeekendDay) return undefined
    if (!ondoToken) return undefined
    if (!isValidQuoteError(error)) return undefined
    if (error.type !== QuoteApiErrorCodes.InsufficientLiquidity) return undefined

    return `${ondoToken.symbol} not tradable until Sunday 23:59 UTC`
  }, [isWeekendDay, error, ondoToken])
}

function isWeekend(): boolean {
  const now = new Date()
  const utcDay = now.getUTCDay()

  // 0 - Sunday, 6 - Saturday
  return utcDay === 0 || utcDay === 6
}
