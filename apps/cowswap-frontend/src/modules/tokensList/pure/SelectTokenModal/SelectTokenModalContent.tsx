import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

interface SelectTokenModalContentProps {
  isRouteAvailable: boolean | undefined
  children: ReactNode
}

export function SelectTokenModalContent({ isRouteAvailable, children }: SelectTokenModalContentProps): ReactNode {
  return (
    <>
      {isRouteAvailable === false ? (
        <styledEl.RouteNotAvailable>
          <Trans>This route is not yet supported.</Trans>
        </styledEl.RouteNotAvailable>
      ) : (
        children
      )}
    </>
  )
}
