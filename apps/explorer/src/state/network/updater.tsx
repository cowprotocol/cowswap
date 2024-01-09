import React, { useEffect } from 'react'
import { Redirect, useLocation } from 'react-router-dom'

import { Network } from 'types'
import useGlobalState from 'hooks/useGlobalState'

import { setNetwork } from './actions'
import { useNetworkId } from './hooks'
import { updateWeb3Provider } from 'api/web3'
import { web3 } from 'apps/explorer/api'

const MAINNET_PREFIX = ''
const NETWORK_PREFIXES_RAW: [Network, string][] = [
  [Network.MAINNET, ''],
  [Network.GNOSIS_CHAIN, 'gc'],
  [Network.GOERLI, 'goerli'],
]
export const PREFIX_BY_NETWORK_ID: Map<Network, string> = new Map(NETWORK_PREFIXES_RAW)
const NETWORK_ID_BY_PREFIX: Map<string, Network> = new Map(NETWORK_PREFIXES_RAW.map(([key, value]) => [value, key]))

function getNetworkId(network = MAINNET_PREFIX): Network {
  const networkId = NETWORK_ID_BY_PREFIX.get(network)
  return networkId || Network.MAINNET
}

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
  const pathMatchArray = pathname.match('/(xdai|mainnet|gc|goerli)?/?(.*)')

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

  return <Redirect push={false} to={newPath} />
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

  return <Redirect push={false} to={newPath} />
}

/** Redirects to the xDai to the GnosisChain new name */
export const RedirectXdai = (): JSX.Element => {
  const newPath = SubstituteNetworkName('xdai', '/gc')

  return <Redirect push={false} to={newPath} />
}

export const NetworkUpdater: React.FC = () => {
  // TODO: why not using useDispatch from https://react-redux.js.org/introduction/quick-start
  // const dispatch = useDispatch()
  const [, dispatch] = useGlobalState()
  const currentNetworkId = useNetworkId()
  const location = useLocation()

  useEffect(() => {
    const networkMatchArray = location.pathname.match('^/(gc|goerli)')
    const network = networkMatchArray && networkMatchArray.length > 0 ? networkMatchArray[1] : undefined
    const networkId = getNetworkId(network)

    // Update the network if it's different
    if (currentNetworkId !== networkId) {
      dispatch(setNetwork(networkId))
      updateWeb3Provider(web3, networkId)
    }
  }, [location, currentNetworkId, dispatch])

  return null
}
