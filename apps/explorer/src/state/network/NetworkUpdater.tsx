import React, { useEffect } from 'react'
import useGlobalState from '../../hooks/useGlobalState'
import { useNetworkId } from './hooks'
import { useLocation } from 'react-router-dom'
import { setNetwork } from './actions'
import { updateWeb3Provider } from '../../api/web3'
import { web3 } from '../../explorer/api'
import { Network } from '../../types'

const MAINNET_PREFIX = ''
const NETWORK_PREFIXES_RAW: [Network, string][] = [
  [Network.MAINNET, ''],
  [Network.GNOSIS_CHAIN, 'gc'],
  [Network.GOERLI, 'goerli'],
]
const NETWORK_ID_BY_PREFIX: Map<string, Network> = new Map(NETWORK_PREFIXES_RAW.map(([key, value]) => [value, key]))

function getNetworkId(network = MAINNET_PREFIX): Network {
  const networkId = NETWORK_ID_BY_PREFIX.get(network)
  return networkId || Network.MAINNET
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
