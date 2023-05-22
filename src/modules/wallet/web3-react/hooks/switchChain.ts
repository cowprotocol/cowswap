import { networkConnection } from 'modules/wallet/web3-react/connection/network'
import { walletConnectConnection } from 'modules/wallet/web3-react/connection/walletConnect'
import { Connector } from '@web3-react/types'
import { getChainInfo } from 'legacy/constants/chainInfo'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { RPC_URLS } from 'legacy/constants/networks'
import { isChainAllowed } from '../connection'

function getRpcUrls(chainId: SupportedChainId): [string] {
  switch (chainId) {
    case SupportedChainId.MAINNET:
    case SupportedChainId.GOERLI:
      return [RPC_URLS[chainId]]
    case SupportedChainId.GNOSIS_CHAIN:
      return ['https://rpc.gnosischain.com/']
    default:
  }
  // Our API-keyed URLs will fail security checks when used with external wallets.
  throw new Error('RPC URLs must use public endpoints')
}

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
