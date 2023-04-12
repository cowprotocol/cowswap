import { networkConnection } from '@cow/modules/wallet/web3-react/connection/network'
import { walletConnectConnection } from '@cow/modules/wallet/web3-react/connection/walletConnect'
import { Connector } from '@web3-react/types'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getRpcUrls } from 'constants/networks'
import { isChainAllowed } from '../connection'

export const switchChain = async (connector: Connector, chainId: SupportedChainId) => {
  if (!isChainAllowed(connector, chainId)) {
    throw new Error(`Chain ${chainId} not supported for connector (${typeof connector})`)
  } else if (connector === walletConnectConnection.connector || connector === networkConnection.connector) {
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
