/**
 * TokenList Slot - Displays list of tokens
 *
 * Uses TokensContent which reads from tokenListViewAtom
 */
import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { TokensContent } from '../../../../pure/TokensContent'
import { useTokenListState } from '../store'

export function TokenList(): ReactNode {
  const { isRouteAvailable } = useTokenListState()

  if (isRouteAvailable === false) {
    return (
      <styledEl.RouteNotAvailable>
        <Trans>This route is not yet supported.</Trans>
      </styledEl.RouteNotAvailable>
    )
  }

  return <TokensContent />
}
