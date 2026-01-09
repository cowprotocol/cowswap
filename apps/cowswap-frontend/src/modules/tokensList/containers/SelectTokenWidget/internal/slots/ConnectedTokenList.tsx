import { ReactNode } from 'react'

import { TokenList } from './TokenList'

import { useTokenListState } from '../../hooks'

export function ConnectedTokenList(): ReactNode {
  const isRouteAvailable = useTokenListState()
  return <TokenList isRouteAvailable={isRouteAvailable} />
}
