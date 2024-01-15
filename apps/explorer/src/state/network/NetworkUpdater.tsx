import React, { useEffect } from 'react'
import useGlobalState from '../../hooks/useGlobalState'
import { useNetworkId } from './hooks'
import { useLocation } from 'react-router-dom'
import { setNetwork } from './actions'
import { updateWeb3Provider } from '../../api/web3'
import { web3 } from '../../explorer/api'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CHAIN_ID_TO_URL_PREFIX, NETWORK_PREFIXES } from '../../consts/network'

const MAINNET_PREFIX = CHAIN_ID_TO_URL_PREFIX[SupportedChainId.MAINNET]
const NETWORK_PREFIXES_RAW: [SupportedChainId, string][] = Object.keys(CHAIN_ID_TO_URL_PREFIX).map((key) => [
  +key, // SupportedChainId is a number enum
  CHAIN_ID_TO_URL_PREFIX[key],
])
const NETWORK_ID_BY_PREFIX: Map<string, SupportedChainId> = new Map(
  NETWORK_PREFIXES_RAW.map(([key, value]) => [value, key])
)

function getNetworkId(network = MAINNET_PREFIX): SupportedChainId {
  const networkId = NETWORK_ID_BY_PREFIX.get(network)
  return networkId || SupportedChainId.MAINNET
}

const NETWORK_MATCH_REGEX = new RegExp(`^/(${NETWORK_PREFIXES})`)

export const NetworkUpdater: React.FC = () => {
  // TODO: why not using useDispatch from https://react-redux.js.org/introduction/quick-start
  // const dispatch = useDispatch()
  const [, dispatch] = useGlobalState()
  const currentNetworkId = useNetworkId()
  const location = useLocation()

  useEffect(() => {
    const networkMatchArray = location.pathname.match(NETWORK_MATCH_REGEX)
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
