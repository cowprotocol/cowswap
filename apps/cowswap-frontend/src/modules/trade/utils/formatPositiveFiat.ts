import { formatFiatAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

export function formatPositiveFiat(amount: CurrencyAmount<Currency> | null): string | undefined {
  if (!amount || !amount.greaterThan(0)) return undefined

  const centScale = Math.max(amount.currency.decimals - 2, 0)
  const oneCent = CurrencyAmount.fromRawAmount(amount.currency, (10n ** BigInt(centScale)).toString())
  if (amount.lessThan(oneCent)) return '<$0.01'

  const formatted = formatFiatAmount(amount)
  return formatted ? `$${formatted}` : undefined
}
