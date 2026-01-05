/**
 * TokenList Slot - Displays list of tokens
 *
 * This is a simple wrapper that renders children (typically TokensContent).
 * The actual token data comes from the tokenListViewAtom which is hydrated
 * by the parent widget.
 */
import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { TokensContent } from '../../../../pure/TokensContent'

export interface TokenListProps {
  isRouteAvailable?: boolean
  children?: ReactNode
}

export function TokenList({ isRouteAvailable, children }: TokenListProps): ReactNode {
  if (isRouteAvailable === false) {
    return (
      <styledEl.RouteNotAvailable>
        <Trans>This route is not yet supported.</Trans>
      </styledEl.RouteNotAvailable>
    )
  }

  // If children provided, render them; otherwise render default TokensContent
  return <>{children ?? <TokensContent />}</>
}
