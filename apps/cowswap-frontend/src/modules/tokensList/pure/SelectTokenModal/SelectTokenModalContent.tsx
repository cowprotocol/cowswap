import { ReactNode } from 'react'

import * as styledEl from './styled'

interface SelectTokenModalContentProps {
  isRouteAvailable: boolean | undefined
  children: ReactNode
}

export function SelectTokenModalContent({ isRouteAvailable, children }: SelectTokenModalContentProps): ReactNode {
  return (
    <>
      {isRouteAvailable === false ? (
        <styledEl.RouteNotAvailable>This route is not currently available</styledEl.RouteNotAvailable>
      ) : (
        children
      )}
    </>
  )
}
