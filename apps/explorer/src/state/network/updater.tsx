import React from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'

import { Navigate, useLocation } from 'react-router'
import { Network } from 'types'

import { NETWORK_PREFIXES } from './const'

const NETWORK_PATH_MATCH_REGEX = new RegExp(`/(${NETWORK_PREFIXES})?/?(.*)`)

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

/** Redirects to the canonnical URL for mainnet */
export const RedirectToNetwork = (props: { networkId: Network }): React.ReactNode | null => {
  const pathnameSuffix = usePathSuffix()
  if (pathnameSuffix === undefined) {
    return null
  }

  const { networkId } = props
  const prefix = CHAIN_INFO[networkId].urlAlias

  const prefixPath = prefix ? `/${prefix}` : ''
  const newPath = prefixPath + '/' + pathnameSuffix

  return <Navigate to={newPath} />
}

/** Replace Network name in URL from X to Y */
const SubstituteNetworkName = (from: string, toNetworkName = ''): string => {
  const { pathname } = useLocation()

  const pathMatchArray = pathname.match(`/${from}(.*)`)
  return pathMatchArray && pathMatchArray.length > 0 ? `${toNetworkName}${pathMatchArray[1]}` : '/'
}

/** Redirects to the canonnical URL for mainnet */
export const RedirectMainnet = (): React.ReactNode => {
  const newPath = SubstituteNetworkName('mainnet')

  return <Navigate to={newPath} />
}

/** Redirects to the xDai to the GnosisChain new name */
export const RedirectXdai = (): React.ReactNode => {
  const newPath = SubstituteNetworkName('xdai', '/gc')

  return <Navigate to={newPath} />
}
