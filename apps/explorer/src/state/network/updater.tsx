import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { Network } from 'types'

const MAINNET_PREFIX = ''
const NETWORK_PREFIXES_RAW: [Network, string][] = [
  [Network.MAINNET, ''],
  [Network.GNOSIS_CHAIN, 'gc'],
  [Network.GOERLI, 'goerli'],
  [Network.SEPOLIA, 'sepolia'],
]
export const PREFIX_BY_NETWORK_ID: Map<Network, string> = new Map(NETWORK_PREFIXES_RAW)

function getNetworkPrefix(network: Network): string {
  const prefix = PREFIX_BY_NETWORK_ID.get(network)
  return prefix || MAINNET_PREFIX
}

/**
 * Decompose URL pathname like /gc/orders/123
 *
 * @returns ['gc', 'orders/123']
 */
export const useDecomposedPath = (): [string, string] | [] => {
  const { pathname } = useLocation()
  const pathMatchArray = pathname.match('/(xdai|mainnet|gc|goerli|sepolia)?/?(.*)')

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
  const prefix = getNetworkPrefix(networkId)

  const prefixPath = prefix ? `/${prefix}` : ''
  const newPath = prefixPath + '/' + pathnameSuffix

  return <Navigate to={newPath} />
}

/** Replace Network name in URL from X to Y */
export const SubstituteNetworkName = (from: string, toNetworkName = ''): string => {
  const { pathname } = useLocation()

  const pathMatchArray = pathname.match(`/${from}(.*)`)
  return pathMatchArray && pathMatchArray.length > 0 ? `${toNetworkName}${pathMatchArray[1]}` : '/'
}

/** Redirects to the canonnical URL for mainnet */
export const RedirectMainnet = (): JSX.Element => {
  const newPath = SubstituteNetworkName('mainnet')

  return <Navigate to={newPath} />
}

/** Redirects to the xDai to the GnosisChain new name */
export const RedirectXdai = (): JSX.Element => {
  const newPath = SubstituteNetworkName('xdai', '/gc')

  return <Navigate to={newPath} />
}
