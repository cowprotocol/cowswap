/**
 * TokenList Slot - Displays list of tokens
 */
import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { TokensContent } from '../../../../pure/TokensContent'
import { useTokenListStore } from '../store'

export function TokenList(): ReactNode {
  const { isRouteAvailable } = useTokenListStore()

  if (isRouteAvailable === false) {
    return (
      <styledEl.RouteNotAvailable>
        <Trans>This route is not yet supported.</Trans>
      </styledEl.RouteNotAvailable>
    )
  }

  return <TokensContent />
}
