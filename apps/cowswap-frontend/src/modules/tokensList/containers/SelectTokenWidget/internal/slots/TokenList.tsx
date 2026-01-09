import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { TokensContent } from '../../../../pure/TokensContent'
import { useTokenListState } from '../../hooks'

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

export function ConnectedTokenList(): ReactNode {
  const isRouteAvailable = useTokenListState()
  return <TokenList isRouteAvailable={isRouteAvailable} />
}
