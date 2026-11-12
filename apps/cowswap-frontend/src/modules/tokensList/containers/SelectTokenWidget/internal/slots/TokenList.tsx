import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { TokensContent } from '../../../../pure/TokensContent'

export interface TokenListProps {
  isRouteAvailable?: boolean
  areFilteredTokensNotBridgeable?: boolean
  notice?: string
}

export function TokenList({
  isRouteAvailable = true,
  areFilteredTokensNotBridgeable = false,
  notice,
}: TokenListProps): ReactNode {
  if (!isRouteAvailable) {
    return (
      <styledEl.RouteNotAvailable>
        <Trans>This route is not yet supported.</Trans>
      </styledEl.RouteNotAvailable>
    )
  }

  return (
    <>
      {notice && <styledEl.TokensFilterNotice>{notice}</styledEl.TokensFilterNotice>}
      {areFilteredTokensNotBridgeable ? (
        <styledEl.RouteNotAvailable>
          <Trans>None of the tokens available here can be bridged to this network yet.</Trans>
        </styledEl.RouteNotAvailable>
      ) : (
        <TokensContent />
      )}
    </>
  )
}
