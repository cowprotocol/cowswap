import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { getTokenAmountTitle, TokenAmount } from '@cowprotocol/ui'

import { useUsdAmount } from 'modules/usdAmount'

import * as styledEl from '../shared/SolverAuctionSharedComponents.styled'
import { formatSolverBidUsdDelta } from '../SolverAuctionResult.utils'

export interface SolverDeltaValueProps {
  buyAmount: CurrencyAmount<Currency>
  delta: CurrencyAmount<Currency>
}

export function SolverDeltaValue({ buyAmount, delta }: SolverDeltaValueProps): ReactNode {
  const { value: usdDelta } = useUsdAmount(delta)
  const tokenTitle = getTokenAmountTitle({ amount: buyAmount, tokenSymbol: buyAmount.currency })

  return (
    <styledEl.BidValueTooltip content={tokenTitle} disableHoverablePopup placement="top">
      <styledEl.BidValue data-testid="solver-auction-bid-value">
        {usdDelta ? (
          formatSolverBidUsdDelta(usdDelta)
        ) : (
          <TokenAmount amount={delta} noTitle prefix="-" tokenSymbol={delta.currency} />
        )}
      </styledEl.BidValue>
    </styledEl.BidValueTooltip>
  )
}
