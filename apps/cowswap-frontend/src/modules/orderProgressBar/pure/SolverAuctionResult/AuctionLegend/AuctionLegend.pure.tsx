import { ReactNode } from 'react'

import { Plural, Trans } from '@lingui/react/macro'

import * as styledEl from './AuctionLegend.styled'

export interface AuctionLegendProps {
  alsoBid: number
  didntBid: number
  total: number
  won: number
}

export function AuctionLegend({ won, alsoBid, didntBid, total }: AuctionLegendProps): ReactNode {
  return (
    <styledEl.Legend>
      <styledEl.LegendItems>
        {won > 0 ? (
          <styledEl.LegendItem>
            <styledEl.LegendDot $kind="won" />
            <Trans>{won} won</Trans>
          </styledEl.LegendItem>
        ) : null}
        {alsoBid > 0 ? (
          <styledEl.LegendItem>
            <styledEl.LegendDot $kind="bid" />
            <Trans>{alsoBid} also bid</Trans>
          </styledEl.LegendItem>
        ) : null}
        {didntBid > 0 ? (
          <styledEl.LegendItem>
            <styledEl.LegendDot $kind="idle" />
            <Trans>{didntBid} didn't bid</Trans>
          </styledEl.LegendItem>
        ) : null}
      </styledEl.LegendItems>
      <styledEl.LegendTotal>
        <Plural value={total} one="# solver" few="# solvers" many="# solvers" other="# solvers" />
      </styledEl.LegendTotal>
    </styledEl.Legend>
  )
}
