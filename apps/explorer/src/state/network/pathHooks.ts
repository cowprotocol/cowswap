import { CHAIN_INFO } from '@cowprotocol/common-const'

import { useLocation } from 'react-router'

import { NETWORK_PREFIXES } from './const'
import { useNetworkId } from './hooks'

const NETWORK_PATH_MATCH_REGEX = new RegExp(`/(${NETWORK_PREFIXES})?/?(.*)`)
const CANONICAL_SOLVERS_PATH_PREFIX = '/solvers'

/**
 * Decompose URL pathname like /gc/orders/123
 *
 * @returns ['gc', 'orders/123']
 */
export const useDecomposedPath = (): [string, string] | [] => {
  const { pathname } = useLocation()
  const pathMatchArray = pathname.match(NETWORK_PATH_MATCH_REGEX)

  return pathMatchArray == null ? [] : [pathMatchArray[1], pathMatchArray[2]]
}

export const usePathPrefix = (): string | undefined => useDecomposedPath()[0]
export const usePathSuffix = (): string | undefined => useDecomposedPath()[1]

export const useNavigationPathPrefix = (): string | undefined => {
  const prefix = usePathPrefix()
  const networkId = useNetworkId()
  const { pathname } = useLocation()
  const isCanonicalSolversPath =
    pathname === CANONICAL_SOLVERS_PATH_PREFIX || pathname.startsWith(`${CANONICAL_SOLVERS_PATH_PREFIX}/`)

  if (prefix || !isCanonicalSolversPath || networkId === null) {
    return prefix
  }

  return CHAIN_INFO[networkId]?.urlAlias || undefined
}
