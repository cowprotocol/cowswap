import { ReactNode } from 'react'

import * as styledEl from './AuctionDotMap.styled'

import { AuctionDotKind, isAuctionDotOddRow } from '../SolverAuctionResult.utils'

export interface AuctionDotMapProps {
  animationKey: number
  dots: AuctionDotKind[]
}

export function AuctionDotMap({ dots, animationKey }: AuctionDotMapProps): ReactNode {
  return (
    <styledEl.DotMap key={animationKey} aria-hidden data-testid="solver-auction-dot-map">
      {dots.map((kind, index) => (
        <styledEl.Dot key={`${kind}-${index}`} $rowIsOdd={isAuctionDotOddRow(index)}>
          <styledEl.DotAnchor $rowIsOdd={isAuctionDotOddRow(index)}>
            <styledEl.DotDisc $kind={kind} $index={index} />
          </styledEl.DotAnchor>
        </styledEl.Dot>
      ))}
    </styledEl.DotMap>
  )
}
