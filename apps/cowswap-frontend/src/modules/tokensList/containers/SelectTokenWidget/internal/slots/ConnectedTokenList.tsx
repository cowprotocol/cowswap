import { ReactNode } from 'react'

import { TokenList } from './TokenList'

import { useTokensToSelect } from '../../../../hooks/useTokensToSelect'

export function ConnectedTokenList(): ReactNode {
  const { isRouteAvailable } = useTokensToSelect()
  return <TokenList isRouteAvailable={isRouteAvailable} />
}
