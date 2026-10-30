import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { TokensContent } from '../../../../pure/TokensContent'

export interface TokenListProps {
  isRouteAvailable?: boolean
  notice?: string
}

export function TokenList({ isRouteAvailable = true, notice }: TokenListProps): ReactNode {
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
      <TokensContent />
    </>
  )
}
