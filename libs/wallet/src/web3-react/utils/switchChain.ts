import { getChainInfo, RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Connector } from '@web3-react/types'

import { getWeb3ReactConnection } from './getWeb3ReactConnection'
import { isChainAllowed } from './isChainAllowed'

import { ConnectionType } from '../../api/types'
import { getIsWalletConnect } from '../hooks/useIsWalletConnect'

function getRpcUrls(chainId: SupportedChainId): [string] {
  const rpcUrl = WALLET_RPC_SUGGESTION[chainId] || RPC_URLS[chainId]

  return [rpcUrl]
}

const WALLET_RPC_SUGGESTION: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: null,
  [SupportedChainId.GNOSIS_CHAIN]: 'https://rpc.gnosischain.com/',
  [SupportedChainId.ARBITRUM_ONE]: 'https://arb1.arbitrum.io/rpc',
  [SupportedChainId.BASE]: 'https://mainnet.base.org',
  [SupportedChainId.SEPOLIA]: null,
  [SupportedChainId.POLYGON]: 'https://polygon-rpc.com/',
  [SupportedChainId.AVALANCHE]: 'https://avalanche-c-chain.public.blastapi.io/',
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
