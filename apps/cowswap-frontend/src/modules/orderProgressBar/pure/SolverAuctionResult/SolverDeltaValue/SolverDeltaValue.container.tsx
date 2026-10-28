import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenAmount } from '@cowprotocol/ui'

import { useUsdAmount } from 'modules/usdAmount'

import * as styledEl from '../shared/SolverAuctionSharedComponents.styled'
import { formatSolverBidUsdDelta } from '../SolverAuctionResult.utils'

export interface SolverDeltaValueProps {
  delta: CurrencyAmount<Currency>
}

export function SolverDeltaValue({ delta }: SolverDeltaValueProps): ReactNode {
  const { value: usdDelta } = useUsdAmount(delta)

  if (usdDelta) {
    return <styledEl.BidValue>{formatSolverBidUsdDelta(usdDelta)}</styledEl.BidValue>
  }

  return (
    <styledEl.BidValue>
      -<TokenAmount amount={delta} tokenSymbol={delta.currency} />
    </styledEl.BidValue>
  )
}
