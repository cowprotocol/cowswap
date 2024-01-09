import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { Network } from 'types'
import { CHAIN_ID_TO_URL_PREFIX, NETWORK_PREFIXES } from '../../consts/network'

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
export const RedirectToNetwork = (props: { networkId: Network }): JSX.Element | null => {
  const pathnameSuffix = usePathSuffix()
  if (pathnameSuffix === undefined) {
    return null
  }

  const { networkId } = props
  const prefix = CHAIN_ID_TO_URL_PREFIX[networkId]

  const prefixPath = prefix ? `/${prefix}` : ''
  const newPath = prefixPath + '/' + pathnameSuffix

  return <Navigate to={newPath} />
}
