import { getChainInfo, RPC_URLS } from '@cowprotocol/common-const'
import {
  arbitrumOne,
  avalanche,
  base,
  bnb,
  gnosisChain,
  lens,
  linea,
  mainnet,
  plasma,
  polygon,
  sepolia,
  ink,
  SupportedChainId,
  HttpsString,
} from '@cowprotocol/cow-sdk'
import { Connector } from '@web3-react/types'

import { getWeb3ReactConnection } from './getWeb3ReactConnection'
import { isChainAllowed } from './isChainAllowed'

import { ConnectionType } from '../../api/types'
import { getIsWalletConnect } from '../hooks/useIsWalletConnect'

function getRpcUrls(chainId: SupportedChainId): [HttpsString] {
  const rpcUrl = WALLET_RPC_SUGGESTION[chainId] || RPC_URLS[chainId]

  return [rpcUrl]
}

const WALLET_RPC_SUGGESTION: Record<SupportedChainId, HttpsString | null> = {
  [SupportedChainId.MAINNET]: mainnet.rpcUrls.default.http[0],
  [SupportedChainId.GNOSIS_CHAIN]: gnosisChain.rpcUrls.default.http[0],
  [SupportedChainId.ARBITRUM_ONE]: arbitrumOne.rpcUrls.default.http[0],
  [SupportedChainId.BASE]: base.rpcUrls.default.http[0],
  [SupportedChainId.SEPOLIA]: sepolia.rpcUrls.default.http[0],
  [SupportedChainId.POLYGON]: polygon.rpcUrls.default.http[0],
  [SupportedChainId.AVALANCHE]: avalanche.rpcUrls.default.http[0],
  [SupportedChainId.LENS]: lens.rpcUrls.default.http[0],
  [SupportedChainId.BNB]: bnb.rpcUrls.default.http[0],
  [SupportedChainId.LINEA]: linea.rpcUrls.default.http[0],
  [SupportedChainId.PLASMA]: plasma.rpcUrls.default.http[0],
  [SupportedChainId.INK]: ink.rpcUrls.default.http[0],
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
      chainName: info.eip155Label,
      rpcUrls: getRpcUrls(chainId),
      nativeCurrency: info.nativeCurrency,
      blockExplorerUrls: [info.explorer],
    }
    await connector.activate(addChainParameter)
  }
}
