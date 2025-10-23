import { ReactNode } from 'react'

import { TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import * as styledEl from './styled'

interface TradeAllowanceDisplayProps {
  currencyToApprove: Currency
  currentAllowance: bigint
}

export function TradeAllowanceDisplay({ currentAllowance, currencyToApprove }: TradeAllowanceDisplayProps): ReactNode {
  const allowanceAmount = CurrencyAmount.fromRawAmount(currencyToApprove, currentAllowance.toString())

  return (
    <styledEl.AllowanceWrapper>
      <styledEl.AllowanceLabel>Current allowance</styledEl.AllowanceLabel>
      <styledEl.AllowanceAmount>
        <TokenAmount amount={allowanceAmount} tokenSymbol={currencyToApprove} />
      </styledEl.AllowanceAmount>
    </styledEl.AllowanceWrapper>
  )
}
