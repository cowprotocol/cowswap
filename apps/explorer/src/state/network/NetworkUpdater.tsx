import React, { useEffect } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router'

import { setNetwork } from './actions'
import { NETWORK_PREFIXES } from './const'
import { useNetworkId } from './hooks'

import { updateWeb3Provider } from '../../api/web3'
import { web3 } from '../../explorer/api'
import useGlobalState from '../../hooks/useGlobalState'

const MAINNET_PREFIX = CHAIN_INFO[SupportedChainId.MAINNET].urlAlias
const NETWORK_PREFIXES_RAW: [SupportedChainId, string][] = Object.keys(CHAIN_INFO).map((key) => {
  const chainId = +key

  return [chainId, CHAIN_INFO[chainId].urlAlias]
})
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
