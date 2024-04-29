import { getChainInfo, RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Connector } from '@web3-react/types'

import { getWeb3ReactConnection } from './getWeb3ReactConnection'
import { isChainAllowed } from './isChainAllowed'

import { ConnectionType } from '../../api/types'
import { getIsWalletConnect } from '../hooks/useIsWalletConnect'

function getRpcUrls(chainId: SupportedChainId): [string] {
  if (chainId === SupportedChainId.GNOSIS_CHAIN) {
    return ['https://rpc.gnosischain.com/']
  }

  return [RPC_URLS[chainId]]
}

export const switchChain = async (connector: Connector, chainId: SupportedChainId) => {
  if (!isChainAllowed(connector, chainId)) {
    throw new Error(`Chain ${chainId} not supported for connector (${typeof connector})`)
  }

  const connection = getWeb3ReactConnection(connector)
  const isNetworkConnection = connection.type === ConnectionType.NETWORK
  const isWalletConnect = getIsWalletConnect(connector)

  if (isNetworkConnection || isWalletConnect) {
    await connector.activate(chainId)
  } else {
    const info = getChainInfo(chainId)
    const addChainParameter = {
      chainId,
      chainName: info.label,
      rpcUrls: getRpcUrls(chainId),
      nativeCurrency: info.nativeCurrency,
      blockExplorerUrls: [info.explorer],
    }
    await connector.activate(addChainParameter)
  }
}
