/**
 * TokenList Slot - Displays the token list content
 *
 * Uses TokensContent which manages its own token data via atoms.
 */
import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { TokensContent } from '../../../../pure/TokensContent'

export interface TokenListProps {
  isRouteAvailable?: boolean
}

export function TokenList({ isRouteAvailable = true }: TokenListProps): ReactNode {
  if (!isRouteAvailable) {
    return (
      <styledEl.RouteNotAvailable>
        <Trans>This route is not yet supported.</Trans>
      </styledEl.RouteNotAvailable>
    )
  }

  return <TokensContent />
}
