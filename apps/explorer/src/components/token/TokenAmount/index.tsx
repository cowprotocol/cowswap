import React from 'react'
import BigNumber from 'bignumber.js'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { FormatAmountPrecision, formatSmartMaxPrecision, formattingAmountPrecision } from 'utils'

interface Props {
  amount: BigNumber
  symbol?: string
  token?: TokenErc20 | null
}

// TODO: unify with TokenAmount in @cowprotocol/cowswap
export const TokenAmount: React.FC<Props> = ({ amount, token, symbol }: Props) => {
  const fullAmount = formatSmartMaxPrecision(amount, token || null)
  const displayedAmount = formattingAmountPrecision(amount, token || null, FormatAmountPrecision.highPrecision)
  const displayedSymbol = symbol || token?.symbol

  return (
    <span title={fullAmount + ' ' + displayedSymbol}>
      {displayedAmount} {displayedSymbol}
    </span>
  )
}
