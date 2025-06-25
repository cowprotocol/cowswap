import React from 'react'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { FormatAmountPrecision, formatSmartMaxPrecision, formattingAmountPrecision } from 'utils'

interface Props {
  amount: BigNumber
  symbol?: string
  token?: TokenErc20 | null
  noSymbol?: boolean
}

// TODO: unify with TokenAmount in @cowprotocol/cowswap
export const TokenAmount: React.FC<Props> = ({ amount, token, symbol, noSymbol }: Props) => {
  const fullAmount = formatSmartMaxPrecision(amount, token || null)
  const displayedAmount = formattingAmountPrecision(amount, token || null, FormatAmountPrecision.highPrecision)
  const displayedSymbol = symbol || token?.symbol

  return (
    <span title={fullAmount + ' ' + displayedSymbol}>
      {displayedAmount} {noSymbol ? '' : displayedSymbol}
    </span>
  )
}
